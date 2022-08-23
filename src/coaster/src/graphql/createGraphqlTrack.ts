import path from "path";

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
  isInvokable,
  getAccessProxy,
  perform,
} from "@baublet/coaster-utils";

import { CoasterTrack } from "../track/types";
import { getFailedTrack } from "../track/getFailedTrack";
import { createGraphqlEndpointHandler } from "./createGraphqlEndpointHandler";
import { log } from "../server/log";
import { ResolvedEndpoint } from "../endpoints/types";

interface CreateGraphqlTrackArguments extends ResolvedEndpoint {
  schemaPath: string;
  resolversPath: string;
  createContext?: (context: any) => any;
}

export async function createGraphqlTrack({
  createContext = (context) => context,
  schemaPath,
  resolversPath,
  endpoint,
  method,
}: Omit<CreateGraphqlTrackArguments, "handler">): Promise<
  CoasterTrack | CoasterError
> {
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
  const accessProxy = getAccessProxy((paths) => {
    const lastPath = paths[paths.length - 1];
    if (lastPath.startsWith("__")) {
      return () => true;
    }
    if (lastPath === "bind") {
      const pathsWithoutBind = paths.slice(0, -1);
      const modulePath = path.resolve(resolversPath, ...pathsWithoutBind);
      const existingResolver = resolversMap.get(modulePath);
      if (existingResolver) {
        return existingResolver;
      }
      const resolver = loadHandlerFromResolversAndPath(
        resolversPath,
        pathsWithoutBind
      );
      resolversMap.set(modulePath, resolver);
      return resolver;
    }
  });

  const graphqlHandler = createGraphqlEndpointHandler({
    createContext,
    resolvers: accessProxy,
    typeDefs: [typeDefs],
  });

  return {
    __isCoasterTrack: true,
    build: (tools) => {
      tools.log.debug("~~ TBD placeholder for building applications ~~");
    },
    handler: graphqlHandler,
    endpoint,
    method,
  };
}

function loadHandlerFromResolversAndPath(
  resolversPath: string,
  modulePaths: string[]
): (...args: any[]) => any {
  const moduleRoot = path.resolve(resolversPath, ...modulePaths);
  const moduleFullPath = moduleRoot + ".ts";
  const leafNode = modulePaths[modulePaths.length - 1];
  const defaultResolver = (parent: any) => {
    if (typeof parent !== "object") {
      return null;
    }
    return parent?.[leafNode];
  };

  let resolverLoaded = false;
  let loadedResolver: any;

  return async (...args: any[]) => {
    if (!resolverLoaded) {
      const moduleExists = await fileExists(moduleFullPath);
      if (isCoasterError(moduleExists)) {
        log.error(
          `FATAL: Unexpected error finding resolver module ${moduleFullPath}`,
          {
            moduleFullPath,
            moduleRoot,
            args,
          }
        );
        resolverLoaded = true;
        loadedResolver = defaultResolver;
        return loadedResolver(...args);
      }

      if (!moduleExists) {
        log.debug(
          `Resolver module ${moduleFullPath} not found, using default module resolver`
        );
        resolverLoaded = true;
        loadedResolver = defaultResolver;
        return loadedResolver(...args);
      }

      const module = await perform(async () => import(moduleFullPath));
      if (isCoasterError(module)) {
        log.error(
          `FATAL: Unexpected error loading resolver module ${moduleFullPath}`,
          module
        );
        resolverLoaded = true;
        loadedResolver = defaultResolver;
        return loadedResolver(...args);
      }

      loadedResolver = module?.["handler"] || module?.["default"];
      if (!loadedResolver) {
        log.error(
          `FATAL: Resolver module ${moduleFullPath} does not export a handler. Resolver modules need to export either "handler" or "default" to work as module resolvers.`,
          {
            moduleKeys: Object.keys(loadedResolver),
          }
        );
        resolverLoaded = true;
        loadedResolver = defaultResolver;
        return loadedResolver(...args);
      }

      if (!isInvokable(loadedResolver)) {
        log.error(
          `FATAL: Resolver module handler ${moduleFullPath} is not a function. Resolver modules must export their handlers as functions. Instead received ${typeof loadedResolver}`,
          module
        );
        resolverLoaded = true;
        loadedResolver = defaultResolver;
        return loadedResolver(...args);
      }
    }

    return loadedResolver(...args);
  };
}
