import {
  CoasterError,
  createCoasterError,
  fullyResolve,
} from "@baublet/coaster-utils";
import { fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest/types";

export async function getImportFromFileDescriptor<T = never>(
  descriptor: Required<FileDescriptor>
): Promise<T | CoasterError> {
  const filePath = descriptor.file;
  const descriptorFileExists = await fileExists(descriptor.file);
  if (!descriptorFileExists) {
    return createCoasterError({
      code: "getImportFromFileDescriptor-fileNotFound",
      message: `File not found: ${descriptor.file}. Search path: ${filePath}`,
    });
  }

  try {
    const importedFile = await import(filePath);
    const importName = descriptor.exportName;

    if (!importName) {
      return createCoasterError({
        code: "getImportFromFileDescriptor-no-export-name",
        message: `Export not found: ${importName} in ${filePath}`,
        details: {
          descriptor,
        },
      });
    }

    if (!(importName in importedFile)) {
      return createCoasterError({
        code: "getImportFromFileDescriptor-export-not-found",
        message: `Export not found: ${importName} in ${filePath}`,
        details: {
          descriptor,
        },
      });
    }

    const importedModule = importedFile[importName];
    const fullyResolvedEndpoint = await fullyResolve<T>(importedModule);

    return fullyResolvedEndpoint;
  } catch (error) {
    return createCoasterError({
      code: "getImportFromFileDescriptor-fileImportError",
      message: `Unexpected error importing file (${filePath})`,
      details: {
        error,
        descriptor,
      },
    });
  }
}
