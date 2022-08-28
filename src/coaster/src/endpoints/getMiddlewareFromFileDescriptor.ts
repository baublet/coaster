import stringify from "safe-json-stringify";

import {
  CoasterError,
  createCoasterError,
  perform,
  isCoasterError,
} from "@baublet/coaster-utils";

import { FileDescriptor } from "../manifest/types";
import { NormalizedEndpointMiddleware } from "../endpoints/types";

export async function getMiddlewareFromFileDescriptor(
  fileDescriptor: FileDescriptor
): Promise<CoasterError | NormalizedEndpointMiddleware> {
  const file = fileDescriptor.file;
  const exportName = fileDescriptor.exportName || "middleware";

  let handler: any;

  return async (context) => {
    if (handler) {
      return perform(() => handler(context));
    }

    const fileImport = await perform(async () => {
      try {
        const fileImport: Record<string, any> = await import(file);
        const exportExists = exportName in fileImport;
        if (!exportExists) {
          return createCoasterError({
            code: "getMiddlewareFromFileDescriptor-export-not-found",
            message: `Endpoint descriptor file ${file} does not export "${exportName}"`,
            details: {
              fileDescriptor,
              stack: new Error().stack,
            },
          });
        }
        return fileImport;
      } catch (error) {
        return createCoasterError({
          code: "getMiddlewareFromFileDescriptor-unexpected-error-importing",
          message: `Unexpected error importing ${file}`,
          details: {
            file,
            exportName,
            error: stringify(error as any),
          },
        });
      }
    });

    if (isCoasterError(fileImport)) {
      return fileImport;
    }

    const fullyResolvedExport = await perform(async () => {
      return fileImport[exportName];
    });
    if (isCoasterError(fullyResolvedExport)) {
      return fullyResolvedExport;
    }

    if (typeof fullyResolvedExport !== "function") {
      return createCoasterError({
        code: "getMiddlewareFromFileDescriptor-export-not-function",
        message: `Endpoint descriptor file ${file} handler must be a function. Instead, received a ${typeof fullyResolvedExport}`,
        details: {
          file,
          exportName,
        },
      });
    }

    handler = fullyResolvedExport;
    return perform(() => handler(context));
  };
}
