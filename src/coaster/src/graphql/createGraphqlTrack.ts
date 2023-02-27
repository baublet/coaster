import {
  fileExists,
  getAllFilesInDirectoryRecursively,
  readFile,
  stat,
} from "@baublet/coaster-fs";
import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  isInvocable,
  perform,
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { CoasterTrack } from "../track/types";
import { getFailedTrack } from "../track/getFailedTrack";
import { createGraphqlEndpointHandler } from "./createGraphqlEndpointHandler";
import { EndpointInput } from "../endpoints/types";
import { buildGraphqlTrack } from "./buildGraphqlTrack";
import { getMethodsFromMethod } from "../endpoints/getMethodsFromMethod";
import { resolverPathsToResolvers } from "./resolverPathsToResolvers";
import { pathsToResolverPaths } from "./pathsToResolverPaths";

interface CreateGraphqlTrackArguments extends EndpointInput {
  schemaPath: string;
  resolversPath: string;
  createContextPath?: string;
  contextType?: string;
}

export async function createGraphqlTrack({
  schemaPath,
  resolversPath,
  endpoint,
  method: methodInput,
  createContextPath,
  contextType,
  middleware,
}: Omit<CreateGraphqlTrackArguments, "handler">): Promise<
  CoasterTrack | CoasterError
> {
  const method = getMethodsFromMethod(methodInput);
  const schemaExists = await fileExists(schemaPath);
  if (isCoasterError(schemaExists)) {
    return getFailedTrack({
      endpoint,
      method,
      error: schemaExists,
    });
  }

  if (!schemaExists) {
    return getFailedTrack({
      endpoint,
      method,
      error: createCoasterError({
        message: "Could not find schema file " + schemaPath,
        code: "createGraphqlTrack-schemaNotFound",
        details: {
          schemaPath,
        },
      }),
    });
  }

  const typeDefs = await readFile(schemaPath);
  if (isCoasterError(typeDefs)) {
    return getFailedTrack({
      endpoint,
      method,
      error: typeDefs,
    });
  }

  const resolversStats = await stat(resolversPath);
  if (isCoasterError(resolversStats)) {
    return getFailedTrack({
      endpoint,
      method,
      error: resolversStats,
    });
  }

  if (!resolversStats.isDirectory()) {
    return getFailedTrack({
      endpoint,
      method,
      error: createCoasterError({
        message: "Resolvers path must be a directory",
        code: "createGraphqlTrack-resolvers-path-must-be-a-directory",
        details: {
          resolversPath,
        },
      }),
    });
  }

  const allResolversFiles = await getAllFilesInDirectoryRecursively(
    resolversPath
  );
  if (isCoasterError(allResolversFiles)) {
    return getFailedTrack({
      endpoint,
      method,
      error: allResolversFiles,
    });
  }

  const resolversMap = new Map<string, (...args: any[]) => any>();
  const resolversAndModules: Record<string, any> = resolverPathsToResolvers({
    getResolver: (pathToModule) => {
      const existingResolver = resolversMap.get(pathToModule);
      if (existingResolver) {
        return existingResolver;
      }
      const resolver = getHandlerFromPath(pathToModule);
      resolversMap.set(pathToModule, resolver);
      return resolver;
    },
    resolverPaths: pathsToResolverPaths({
      ignorePatterns: [],
      paths: allResolversFiles,
      resolversPath,
    }),
  });

  let createContext: (context: any) => any = (context) => context;
  let resolvedContextType: string =
    contextType || "@baublet/coaster#RequestContext";
  if (createContextPath) {
    try {
      const createContextModule = await import(createContextPath);
      const createContextFunction = createContextModule["createContext"];
      if (!isInvocable(createContextFunction)) {
        return getFailedTrack({
          endpoint,
          method,
          error: createCoasterError({
            message:
              "Create context function must be invocable, and as an export named 'createContext'",
            code: "createGraphqlTrack-create-context-function-must-be-invocable",
            details: {
              createContextPath,
              createContextFunction,
              createContextModule,
            },
          }),
        });
      }
      createContext = createContextFunction;
      resolvedContextType = `${createContextPath}#createContext`;
    } catch (error) {
      return getFailedTrack({
        endpoint,
        method,
        error: createCoasterError({
          code: "createGraphqlTrack-create-context-module-not-found",
          message: `Could not find create context module ${createContextPath}`,
          details: {
            createContextPath,
            error,
          },
        }),
      });
    }
  }

  const graphqlHandler = createGraphqlEndpointHandler({
    createContext,
    resolvers: resolversAndModules,
    typeDefs: [typeDefs],
    playgroundEnabled: true,
  });

  return {
    __isCoasterTrack: true,
    build: (tools) => {
      return buildGraphqlTrack({
        tools,
        schemaPath,
        contextType: resolvedContextType,
      });
    },
    buildWatchPatterns: [schemaPath],
    handler: graphqlHandler,
    endpoint,
    method,
    middleware,
  };
}

function getHandlerFromPath(modulePath: string): (...args: any[]) => any {
  let loadedResolver: (...args: any[]) => any;

  function getErrorResolver(error: CoasterError) {
    return () => {
      throw error;
    };
  }

  return async (...args: any[]) => {
    if (loadedResolver) {
      return loadedResolver(...args);
    }

    const moduleExists = await fileExists(modulePath);
    if (isCoasterError(moduleExists)) {
      log.error(
        `FATAL: Unexpected error finding resolver module ${modulePath}`,
        {
          modulePath,
          args,
        }
      );
      return getErrorResolver(moduleExists);
    }

    if (!moduleExists) {
      log.error(`Resolver module ${modulePath} not found`);
      return getErrorResolver(
        createCoasterError({
          code: "createGraphqlTrack-resolver-module-not-found",
          message: `Resolver module ${modulePath} not found`,
        })
      );
    }

    const module = await perform(async () => import(modulePath));
    if (isCoasterError(module)) {
      log.error(
        `FATAL: Unexpected error loading resolver module ${modulePath}`,
        module
      );
      return getErrorResolver(module);
    }

    loadedResolver = module?.["handler"];
    if (!loadedResolver) {
      log.error(
        `FATAL: Resolver module ${modulePath} does not export a handler. Resolver modules need to export a named "handler" to work as module resolvers.`,
        {
          moduleKeys: Object.keys(loadedResolver),
        }
      );
      return getErrorResolver(
        createCoasterError({
          code: "createGraphqlTrack-resolver-module-missing-handler",
          message: `Resolver module ${modulePath} does not export a handler. Resolver modules need to export a named "handler" to work as module resolvers.`,
        })
      );
    }

    if (!isInvocable(loadedResolver)) {
      log.error(
        `FATAL: Resolver module handler ${modulePath} is not a function. Resolver modules must export their handlers as functions. Instead received ${typeof loadedResolver}`,
        module
      );
      return getErrorResolver(
        createCoasterError({
          code: "createGraphqlTrack-resolver-module-handler-not-invocable",
          message: `Resolver module handler ${modulePath} is not a function. Resolver modules must export their handlers as functions. Instead received ${typeof loadedResolver}`,
        })
      );
    }

    return loadedResolver(...args);
  };
}
