import {
  asTypeOrError,
  CoasterError,
  createCoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";

import { HTTP_METHODS, NormalizedEndpoint } from "./types";

export function normalizeEndpoint(
  endpoint: unknown
): NormalizedEndpoint | CoasterError {
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

  return {
    endpoint: route,
    method,
    handler,
  };
}
