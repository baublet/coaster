import path from "path";

import {
  CoasterError,
  createCoasterError,
  arrayIncludes,
  fullyResolve,
  perform,
  isCoasterError,
  collate,
} from "@baublet/coaster-utils";

import { FileDescriptor, ModuleMetadata } from "../manifest/types";
import {
  HTTP_METHODS_LOWERCASE,
  HttpMethod,
  ResolvedEndpoint,
  NormalizedEndpointMiddleware,
  EndpointInput,
} from "./types";
import { getMiddlewareFromFileDescriptor } from "./getMiddlewareFromFileDescriptor";
import { RequestContext } from "../context/request";
import { getNormalizedFileDescriptorFromFileInput } from "../common/getNormalizedFileDescriptorFromFileInput";

export async function getEndpointFromFileDescriptor({
  fileDescriptor,
  endpointFileFullPath,
}: {
  fileDescriptor: FileDescriptor;
  endpointFileFullPath: string;
}): Promise<CoasterError | ResolvedEndpoint> {
  const normalizedDescriptor = getNormalizedFileDescriptorFromFileInput({
    fileInput: fileDescriptor,
    exportNameIfNotSpecified: "endpoint",
    referenceFileFullPath: endpointFileFullPath,
  });

  if (isCoasterError(normalizedDescriptor)) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-normalizedDescriptorError",
      message: "Unexpected error getting normalized descriptor from file input",
      details: { fileDescriptor, endpointFileFullPath },
      previousError: normalizedDescriptor,
    });
  }

  const fileImport = await perform(async () => {
    try {
      const fileImport: Record<string, any> = await import(
        normalizedDescriptor.file
      );
      const exportExists = normalizedDescriptor.exportName in fileImport;
      if (!exportExists) {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-found",
          message: `Endpoint descriptor file ${normalizedDescriptor.file} does not export "${normalizedDescriptor.exportName}"`,
          details: { normalizedDescriptor },
        });
      }
      return fileImport;
    } catch (error) {
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-unexpected-error-importing",
        message: `Unexpected error importing ${normalizedDescriptor.file}`,
        error,
        details: {
          normalizedDescriptor,
        },
      });
    }
  });

  if (isCoasterError(fileImport)) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-fileImportError",
      message: "Unexpected error importing endpoint file",
      details: { fileDescriptor, endpointFileFullPath },
      previousError: fileImport,
    });
  }

  const fullyResolvedExport = await perform(async () => {
    const moduleMetadata: ModuleMetadata = {
      filePath: normalizedDescriptor.file,
      fileBaseName: path.basename(normalizedDescriptor.file),
      importName: normalizedDescriptor.exportName,
    };

    const resolvedExport: Omit<
      ResolvedEndpoint,
      "middleware" | "buildWatchPatterns"
    > & {
      middleware: EndpointInput["middleware"];
      buildWatchPatterns: string[];
    } = await fullyResolve(
      fileImport[normalizedDescriptor.exportName],
      moduleMetadata
    );
    return resolvedExport;
  });
  if (isCoasterError(fullyResolvedExport)) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-fullyResolvedExportError",
      message: "Unexpected error fully resolving endpoint export",
      details: { fileDescriptor, endpointFileFullPath },
      previousError: fullyResolvedExport,
    });
  }
  const declaredMethods = fullyResolvedExport?.method || "GET";
  const methods: HttpMethod[] = [];
  if (Array.isArray(declaredMethods)) {
    for (const method of declaredMethods) {
      if (typeof method !== "string") {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-string",
          message: `Endpoint descriptor method names must be strings or arrays of strings. Instead, received a ${typeof method}`,
          details: { normalizedDescriptor },
        });
      }
      const lowercaseMethod = method.toLowerCase();

      // Already in the methods? Duplicate, so we don't add it again
      if (arrayIncludes(methods, lowercaseMethod)) {
        continue;
      }

      // If it's a valid method, add it
      if (!arrayIncludes(HTTP_METHODS_LOWERCASE, lowercaseMethod)) {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-export-not-valid-method",
          message: `Method "${method}" is not a valid HTTP method`,
          details: { normalizedDescriptor },
        });
      }

      methods.push(method);
    }
  } else {
    const lowercaseMethod = declaredMethods.toLowerCase();

    // If it's a valid method, add it
    if (!arrayIncludes(HTTP_METHODS_LOWERCASE, lowercaseMethod)) {
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-export-not-valid-method",
        message: `Method ${lowercaseMethod} is not a valid HTTP method`,
        details: { normalizedDescriptor },
      });
    }

    methods.push(lowercaseMethod as HttpMethod);
  }

  const endpointExists = "endpoint" in fullyResolvedExport;
  if (!endpointExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-endpoint",
      message: `Endpoint descriptor file does not export an endpoint descriptor (e.g., "/api")`,
      details: { normalizedDescriptor },
    });
  }

  const endpoint = fullyResolvedExport.endpoint;
  if (typeof endpoint !== "string") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-string",
      message: `Endpoint descriptor file endpoint must be a string. Instead, received a ${typeof endpoint}`,
      details: { normalizedDescriptor },
    });
  }

  const handlerExists = "handler" in fullyResolvedExport;
  if (!handlerExists) {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-handler",
      message: `Endpoint descriptor file does not export a handler`,
      details: { normalizedDescriptor },
    });
  }

  const handler = fullyResolvedExport.handler;
  if (typeof handler !== "function") {
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-export-not-function",
      message: `Endpoint descriptor file handler must be a function. Instead, received a ${typeof handler}`,
      details: { normalizedDescriptor },
    });
  }

  const aggregatedMiddleware: Promise<
    NormalizedEndpointMiddleware | CoasterError
  >[] = [];
  const collatedMiddleware = collate(fullyResolvedExport.middleware);
  for (const middlewareItem of collatedMiddleware) {
    if (typeof middlewareItem === "function") {
      aggregatedMiddleware.push(Promise.resolve(middlewareItem));
      continue;
    }

    const normalizedMiddlewareDescriptor =
      getNormalizedFileDescriptorFromFileInput({
        fileInput: middlewareItem,
        exportNameIfNotSpecified: "middleware",
        referenceFileFullPath: normalizedDescriptor.file,
      });

    if (isCoasterError(normalizedMiddlewareDescriptor)) {
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-normalizedMiddlewareDescriptorError",
        message: "Unexpected error normalizing middleware descriptor",
        details: { fileDescriptor, endpointFileFullPath },
        previousError: normalizedMiddlewareDescriptor,
      });
    }

    let handlerPromise: Promise<CoasterError | NormalizedEndpointMiddleware>;
    const handlerFn = async (context: RequestContext) => {
      if (!handlerPromise) {
        handlerPromise = getMiddlewareFromFileDescriptor(
          normalizedMiddlewareDescriptor
        );
      }

      const resolvedHandler = await handlerPromise;
      if (isCoasterError(resolvedHandler)) {
        context.log("error", "Middleware error", {
          error: resolvedHandler,
        });
        context.response.status(500);
        if (context.request.header("content-type") === "application/json") {
          context.response.json({ error: resolvedHandler });
        } else {
          context.response.send(resolvedHandler.message);
        }
        return;
      }

      return resolvedHandler(context);
    };
    handlerFn.__coasterMiddlewareNameHint =
      `${normalizedMiddlewareDescriptor.file}#${normalizedMiddlewareDescriptor.exportName}`.replace(
        process.cwd(),
        ""
      );
    aggregatedMiddleware.push(Promise.resolve(handlerFn));
    continue;
  }

  const resolvedMiddleware = await Promise.all(aggregatedMiddleware);
  const middleware: NormalizedEndpointMiddleware[] = [];
  for (const resolvedValue of resolvedMiddleware) {
    if (isCoasterError(resolvedValue)) {
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-resolvedMiddlewareError",
        message: "Unexpected error resolving middleware",
        details: { fileDescriptor, endpointFileFullPath },
        previousError: resolvedValue,
      });
    }
    middleware.push(resolvedValue);
  }

  return {
    ...fullyResolvedExport,
    endpoint,
    method: methods,
    handler,
    middleware,
    build: fullyResolvedExport.build,
  };
}
