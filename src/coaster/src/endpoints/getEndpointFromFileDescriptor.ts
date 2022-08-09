import {
  CoasterError,
  createCoasterError,
  arrayIncludes,
  fullyResolve,
  perform,
  isCoasterError,
} from "@baublet/coaster-utils";
import { fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest/types";
import { HTTP_METHODS, HttpMethod, ResolvedEndpoint } from "./types";

export async function getEndpointFromFileDescriptor(
  fileDescriptor: FileDescriptor
): Promise<CoasterError | ResolvedEndpoint> {
  const file = fileDescriptor.file;
  const exportName = fileDescriptor.exportName || "default";

  const exists = await fileExists(file);
  if (!exists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-file-not-found",
      message: `Endpoint descriptor file ${file} not found`,
    });
  }

  const fileImport = await perform(async () => {
    try {
      const fileImport: Record<string, any> = await import(file);
      const exportExists = exportName in fileImport;
      if (!exportExists) {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-found",
          message: `Endpoint descriptor file ${file} does not export "${exportName}"`,
        });
      }
      return fileImport;
    } catch (error) {
      return "module-not-found";
    }
  });

  if (isCoasterError(fileImport)) {
    return fileImport;
  }

  if (fileImport === "module-not-found") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-module-not-found",
      message: `Endpoint descriptor file ${file} not found`,
      details: {
        file,
        exportName,
      },
    });
  }

  const fullyResolvedExport = await perform(async () => {
    const resolvedExport: Partial<ResolvedEndpoint> = await fullyResolve(
      fileImport[exportName]
    );
    return resolvedExport;
  });
  if (isCoasterError(fullyResolvedExport)) {
    return fullyResolvedExport;
  }

  const declaredMethods = fullyResolvedExport.method || "get";
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

  const endpointExists = "endpoint" in fullyResolvedExport;
  if (!endpointExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-endpoint",
      message: `Endpoint descriptor file ${file} does not export an endpoint descriptor (e.g., "/api")`,
    });
  }

  const endpoint = fullyResolvedExport.endpoint;
  if (typeof endpoint !== "string") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-string",
      message: `Endpoint descriptor file ${file} endpoint must be a string. Instead, received a ${typeof endpoint}`,
    });
  }

  const handlerExists = "handler" in fullyResolvedExport;
  if (!handlerExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-handler",
      message: `Endpoint descriptor file ${file} does not export a handler`,
    });
  }

  const handler = fullyResolvedExport.handler;
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
