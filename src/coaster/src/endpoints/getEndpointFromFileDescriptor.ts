import {
  CoasterError,
  createCoasterError,
  arrayIncludes,
} from "@baublet/coaster-utils";
import { fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest/types";
import { EndPoint, HTTP_METHODS, HttpMethod } from "./types";

export async function getEndpointFromFileDescriptor(
  fileDescriptor: FileDescriptor
): Promise<CoasterError | EndPoint> {
  const file = fileDescriptor.file;
  const exportName = fileDescriptor.exportName || "default";

  const exists = await fileExists(file);
  if (!exists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-file-not-found",
      message: `Endpoint descriptor file ${file} not found`,
    });
  }

  const fileImport = await import(file);
  const exportExists = "exportName" in fileImport;
  if (!exportExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-found",
      message: `Endpoint descriptor file ${file} does not export ${exportName}`,
    });
  }

  const declaredMethods = fileImport[exportName] || "get";
  const methods: HttpMethod[] = [];
  if (Array.isArray(declaredMethods)) {
    for (const method of declaredMethods) {
      if (typeof method !== "string") {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-string",
          message: `Endpoint descriptor file ${file} method names must be strings or arrays of strings. Instead, received a ${typeof method}`,
        });
      }
      const lowercaseMethod = method.toLowerCase();

      // Already in the methods? Duplicate, so we don't add it again
      if (arrayIncludes(methods, lowercaseMethod)) {
        continue;
      }

      // If it's a valid method, add it
      if (!arrayIncludes(HTTP_METHODS, lowercaseMethod)) {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-valid-method",
          message: `Endpoint descriptor file ${file} method ${method} is not a valid HTTP method`,
        });
      }

      methods.push(lowercaseMethod);
    }
  } else {
    const lowercaseMethod = declaredMethods.toLowerCase();

    // If it's a valid method, add it
    if (!arrayIncludes(HTTP_METHODS, lowercaseMethod)) {
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-export-not-valid-method",
        message: `Endpoint descriptor file ${file} method ${lowercaseMethod} is not a valid HTTP method`,
      });
    }

    methods.push(lowercaseMethod);
  }

  const endpointExists = "endpoint" in fileImport[exportName];
  if (!endpointExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-endpoint",
      message: `Endpoint descriptor file ${file} does not export an endpoint`,
    });
  }

  const endpoint = fileImport[exportName].endpoint;
  if (typeof endpoint !== "string") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-string",
      message: `Endpoint descriptor file ${file} endpoint must be a string. Instead, received a ${typeof endpoint}`,
    });
  }

  const handlerExists = "handler" in fileImport[exportName];
  if (!handlerExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-handler",
      message: `Endpoint descriptor file ${file} does not export a handler`,
    });
  }

  const handler = fileImport[exportName].handler;
  if (typeof handler !== "function") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-function",
      message: `Endpoint descriptor file ${file} handler must be a function. Instead, received a ${typeof handler}`,
    });
  }

  return {
    endpoint,
    method: methods,
    handler,
  };
}
