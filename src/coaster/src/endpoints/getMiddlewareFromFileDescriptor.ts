import {
  CoasterError,
  createCoasterError,
  perform,
  isCoasterError,
} from "@baublet/coaster-utils";

import { FileDescriptor } from "../manifest/types";
import { NormalizedEndpointMiddleware } from "../endpoints/types";
import { RequestContext } from "../context/request";

export async function getMiddlewareFromFileDescriptor(
  fileDescriptor: FileDescriptor
): Promise<CoasterError | NormalizedEndpointMiddleware> {
  const file = fileDescriptor.file;
  const exportName = fileDescriptor.exportName || "middleware";

  let handler: any;

  const middlewareHandler = async (context: RequestContext) => {
    if (handler) {
      return perform(() => handler(context));
    }

    const fileImport = await perform(async () => {
      try {
        const fileImport: Record<string, any> = await import(file);
        if (!fileImport || typeof fileImport !== "object") {
          return createCoasterError({
            code: "getMiddlewareFromFileDescriptor-file-import-not-object",
            message: `Middleware descriptor file ${file} does not export an object`,
            details: { fileDescriptor, type: typeof fileImport },
          });
        }

        const exportExists = exportName in fileImport;
        if (!exportExists) {
          return createCoasterError({
            code: "getMiddlewareFromFileDescriptor-export-not-found",
            message: `Endpoint descriptor file ${file} does not export "${exportName}"`,
            details: {
              fileDescriptor,
              exports: Object.keys(fileImport),
            },
          });
        }
        return fileImport;
      } catch (error) {
        return createCoasterError({
          code: "getMiddlewareFromFileDescriptor-unexpected-error-importing",
          message: `Unexpected error importing ${file}`,
          error,
          details: {
            file,
            exportName,
          },
        });
      }
    });

    if (isCoasterError(fileImport)) {
      return createCoasterError({
        code: "getMiddlewareFromFileDescriptor-unexpected-error-importing",
        message: `Unexpected error importing ${file}`,
        details: { file },
        previousError: fileImport,
      });
    }

    const fullyResolvedExport = await perform(async () => {
      return fileImport[exportName];
    });
    if (isCoasterError(fullyResolvedExport)) {
      return createCoasterError({
        code: "getMiddlewareFromFileDescriptor-unexpected-error-importing",
        message: `Unexpected error resolving ${file}#${exportName}`,
        details: {
          file,
          exportName,
        },
        previousError: fullyResolvedExport,
      });
    }

    if (typeof fullyResolvedExport !== "function") {
      return createCoasterError({
        code: "getMiddlewareFromFileDescriptor-export-not-function",
        message: `Endpoint descriptor file ${file}#${exportName} handler must be a function. Instead, received a ${typeof fullyResolvedExport}`,
        details: {
          file,
          exportName,
        },
      });
    }

    handler = fullyResolvedExport;
    return perform(() => handler(context));
  };
  middlewareHandler.name = `${file}#${exportName}`;

  return middlewareHandler;
}
