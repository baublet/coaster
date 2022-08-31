import {
  asTypeOrError,
  CoasterError,
  createCoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";
import { resolveInputPathFromFile } from "../common/resolveInputPathFromFile";
import { getMiddlewareFromFileDescriptor } from "./getMiddlewareFromFileDescriptor";

import {
  HTTP_METHODS,
  NormalizedEndpoint,
  NormalizedEndpointMiddleware,
  ResolvedEndpoint,
} from "./types";

export async function normalizeEndpoint(
  endpoint: ResolvedEndpoint,
  manifestFullPath: string
): Promise<NormalizedEndpoint | CoasterError> {
  const endpointAsRecord = asTypeOrError("object", endpoint);
  if (isCoasterError(endpointAsRecord)) {
    return endpointAsRecord;
  }

  let route = "*";
  if (endpointAsRecord.endpoint) {
    const castRoute = asTypeOrError("string", endpointAsRecord.endpoint);
    if (isCoasterError(castRoute)) {
      return createCoasterError({
        code: "normalizeEndpoint-route-not-string",
        message: `Expected endpoint route, if provided, to be a string, but instead received a ${typeof endpointAsRecord.route}`,
        error: route,
      });
    }
    route = castRoute;
  }

  const method = (() => {
    if (!endpointAsRecord.method) {
      return [...HTTP_METHODS];
    }

    if (Array.isArray(endpointAsRecord.method)) {
      const methods: string[] = [];
      for (const subjectMethod of endpointAsRecord.method) {
        const method = asTypeOrError("string", subjectMethod);
        if (isCoasterError(method)) {
          return createCoasterError({
            code: "normalizeEndpoint-method-not-string",
            message: `Expected endpoint method to be a string, but instead received a ${typeof endpointAsRecord.method}`,
            error: method,
          });
        }
        methods.push(method);
      }
      return methods;
    }
    const method = asTypeOrError("string", endpointAsRecord.method);
    if (isCoasterError(method)) {
      return createCoasterError({
        code: "normalizeEndpoint-method-not-string",
        message: `Expected endpoint method to be a string, but instead received a ${typeof endpointAsRecord.method}`,
        error: method,
      });
    }
    return [method];
  })();

  if (isCoasterError(method)) {
    return method;
  }

  const handler = asTypeOrError("function", endpointAsRecord.handler);
  if (isCoasterError(handler)) {
    return createCoasterError({
      code: "normalizeEndpoint-handler-not-function",
      message: `Expected endpoint handler to be a function, but instead received a ${typeof endpointAsRecord.handler}`,
      error: handler,
    });
  }

  const middleware: NormalizedEndpointMiddleware[] = [];
  if (endpointAsRecord.middleware) {
    const middlewareDescriptors = Array.isArray(endpointAsRecord.middleware)
      ? endpointAsRecord.middleware
      : [endpointAsRecord.middleware];
    for (const middlewareDescriptor of middlewareDescriptors) {
      if (typeof middlewareDescriptor === "function") {
        middleware.push(middlewareDescriptor);
        continue;
      }

      if (typeof middlewareDescriptor === "object") {
        if (typeof middlewareDescriptor.file !== "string") {
          return createCoasterError({
            code: "normalizeEndpoint-invalid-middleware-descriptor",
            message: `Expected endpoint middleware to be a string, handler function, or file descriptor, or array of those.`,
            error: handler,
            details: {
              middlewareDescriptor,
            },
          });
        }

        if (
          middlewareDescriptor.exportName &&
          typeof middlewareDescriptor.exportName !== "string"
        ) {
          return createCoasterError({
            code: "normalizeEndpoint-invalid-middleware-descriptor",
            message: `Expected endpoint file descriptor export name to be a string, but instead received a ${typeof middlewareDescriptor.exportName}`,
            error: handler,
            details: {
              middlewareDescriptor,
            },
          });
        }
        const middlewareFunction = await getMiddlewareFromFileDescriptor({
          file: resolveInputPathFromFile(
            middlewareDescriptor.file,
            manifestFullPath
          ),
          exportName: middlewareDescriptor.exportName,
        });

        if (isCoasterError(middlewareFunction)) {
          return middlewareFunction;
        }

        middleware.push(middlewareFunction);
        continue;
      }

      if (typeof middlewareDescriptor === "string") {
        const middlewareFunction = await getMiddlewareFromFileDescriptor({
          file: resolveInputPathFromFile(
            middlewareDescriptor,
            manifestFullPath
          ),
        });

        if (isCoasterError(middlewareFunction)) {
          return middlewareFunction;
        }

        middleware.push(middlewareFunction);
        continue;
      }

      return createCoasterError({
        code: "normalizeEndpoint-invalid-middleware-descriptor",
        message: `Expected endpoint middleware to be a string, handler function, or file descriptor, or array of those.`,
        details: {
          type: typeof middlewareDescriptor,
          middlewareDescriptor,
        },
      });
    }
  }

  return {
    endpoint: route,
    method,
    handler,
    middleware,
  };
}
