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
  const endpointAsRecord = asTypeOrError("object", endpoint);
  if (isCoasterError(endpointAsRecord)) {
    return createCoasterError({
      code: "normalizeEndpoint-endpoint-not-object",
      message: `Expected endpoint to be an object, but got a ${typeof endpoint}`,
      error: endpointAsRecord,
    });
  }

  const route = asTypeOrError("string", endpointAsRecord.route);
  if (isCoasterError(route)) {
    return createCoasterError({
      code: "normalizeEndpoint-route-not-string",
      message: `Expected endpoint route to be a string, but got a ${typeof endpointAsRecord.route}`,
      error: route,
    });
  }

  const method = asTypeOrError("string", endpointAsRecord.method);
  if (isCoasterError(method)) {
    return createCoasterError({
      code: "normalizeEndpoint-method-not-string",
      message: `Expected endpoint method to be a string, but got a ${typeof endpointAsRecord.method}`,
      error: method,
    });
  }

  const handler = asTypeOrError("function", endpointAsRecord.handler);
  if (isCoasterError(handler)) {
    return createCoasterError({
      code: "normalizeEndpoint-handler-not-function",
      message: `Expected endpoint handler to be a function, but got a ${typeof endpointAsRecord.handler}`,
      error: handler,
    });
  }

  return {
    endpoint: route,
    method,
    handler,
  };
}