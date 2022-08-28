import stringify from "safe-json-stringify";

import {
  CoasterError,
  createCoasterError,
  arrayIncludes,
  fullyResolve,
  perform,
  isCoasterError,
  collate,
} from "@baublet/coaster-utils";

import { FileDescriptor } from "../manifest/types";
import {
  HTTP_METHODS,
  HttpMethod,
  ResolvedEndpoint,
  NormalizedEndpointMiddleware,
  EndpointInput,
} from "./types";
import { getMiddlewareFromFileDescriptor } from "./getMiddlewareFromFileDescriptor";
import { RequestContext } from "../context/request";

export async function getEndpointFromFileDescriptor(
  fileDescriptor: FileDescriptor
): Promise<CoasterError | ResolvedEndpoint> {
  const file = fileDescriptor.file;
  const exportName = fileDescriptor.exportName || "endpoint";

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
      return createCoasterError({
        code: "getEndpointFromFileDescriptor-unexpected-error-importing",
        message: `Unexpected error importing ${file}`,
        details: {
          error: stringify(error as any),
          exportName,
        },
      });
    }
  });

  if (isCoasterError(fileImport)) {
    return fileImport;
  }

  const fullyResolvedExport = await perform(async () => {
    const resolvedExport: Omit<ResolvedEndpoint, "middleware"> & {
      middleware: EndpointInput["middleware"];
    } = await fullyResolve(fileImport[exportName]);
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

  const aggregatedMiddleware: Promise<
    NormalizedEndpointMiddleware | CoasterError
  >[] = [];
  const collatedMiddleware = collate(fullyResolvedExport.middleware);
  for (const middlewareItem of collatedMiddleware) {
    if (typeof middlewareItem === "function") {
      aggregatedMiddleware.push(Promise.resolve(middlewareItem));
      continue;
    }
    if (typeof middlewareItem === "object") {
      const fileName = middlewareItem.file;
      const exportName = middlewareItem.exportName || "middleware";
      if (!fileName || !exportName) {
        return createCoasterError({
          code: "getEndpointFromFileDescriptor-invalid-middleware-descriptor",
          message: `Middleware descriptor/handler in ${file} middleware must be a function, string, file descriptor, or array of any of the above.`,
          details: {
            middlewareDescriptor: middlewareItem,
          },
        });
      }

      let handlerPromise: Promise<CoasterError | NormalizedEndpointMiddleware>;
      const handlerFn = async (context: RequestContext) => {
        if (!handlerPromise) {
          handlerPromise = getMiddlewareFromFileDescriptor({
            file: fileName,
            exportName,
          });
        }

        const resolvedHandler = await handlerPromise;
        if (isCoasterError(resolvedHandler)) {
          context.log("error", "Middleware error", {
            error: resolvedHandler,
          });
          context.response.setStatus(500);
          if (
            context.request.headers.get("content-type") === "application/json"
          ) {
            context.response.sendJson({ error: resolvedHandler });
          } else {
            context.response.setData(resolvedHandler.message);
          }
          context.response.flushData();
          return;
        }

        return resolvedHandler(context);
      };
      handlerFn.__coasterMiddlewareNameHint =
        `${fileName}#${exportName}`.replace(process.cwd(), "");
      aggregatedMiddleware.push(Promise.resolve(handlerFn));
      continue;
    }
    if (typeof middlewareItem === "string") {
      let handlerPromise: Promise<CoasterError | NormalizedEndpointMiddleware>;
      const handlerFn = async (context: RequestContext) => {
        if (!handlerPromise) {
          handlerPromise = getMiddlewareFromFileDescriptor({
            file: middlewareItem,
            exportName: "middleware",
          });
        }

        const resolvedHandler = await handlerPromise;
        if (isCoasterError(resolvedHandler)) {
          context.response.setStatus(500);
          if (
            context.request.headers.get("content-type") === "application/json"
          ) {
            context.response.sendJson({ error: resolvedHandler });
          } else {
            context.response.setData(resolvedHandler.message);
          }
          context.response.flushData();
          return;
        }

        return resolvedHandler(context);
      };
      handlerFn.__coasterMiddlewareNameHint = middlewareItem.replace(
        process.cwd(),
        ""
      );
      aggregatedMiddleware.push(Promise.resolve(handlerFn));
      continue;
    }
    return createCoasterError({
      code: "getEndpointFromFileDescriptor-invalid-middleware-descriptor",
      message: `Middleware descriptor/handler in ${file} middleware must be a function, string, file descriptor, or array of any of the above.`,
      details: {
        middlewareDescriptor: middlewareItem,
      },
    });
  }

  const resolvedMiddleware = await Promise.all(aggregatedMiddleware);
  const middleware: NormalizedEndpointMiddleware[] = [];
  for (const resolvedValue of resolvedMiddleware) {
    if (isCoasterError(resolvedValue)) {
      return resolvedValue;
    }
    middleware.push(resolvedValue);
  }

  return {
    ...fullyResolvedExport,
    endpoint,
    method: methods,
    handler,
    middleware,
  };
}
