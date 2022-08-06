import {
  asTypeOrError,
  CoasterError,
  createCoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";

import { NormalizedEndpoint } from "./types";

export function normalizeEndpoint(
  endpoint: unknown
): NormalizedEndpoint | CoasterError {
  console.log({ endpoint });

  const endpointAsRecord = asTypeOrError("object", endpoint);
  if (isCoasterError(endpointAsRecord)) {
    return createCoasterError({
      code: "normalizeEndpoint-endpoint-not-object",
      message: `Expected endpoint to be an object, but instead received a ${typeof endpoint}`,
      error: endpointAsRecord,
    });
  }

  const route = asTypeOrError("string", endpointAsRecord.endpoint);
  if (isCoasterError(route)) {
    return createCoasterError({
      code: "normalizeEndpoint-route-not-string",
      message: `Expected endpoint route to be a string, but instead received a ${typeof endpointAsRecord.route}`,
      error: route,
    });
  }

  const method = (() => {
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
