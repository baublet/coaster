import {
  CoasterError,
  assertIsError,
  createCoasterError,
  fullyResolve,
} from "@baublet/coaster-utils";
import { fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest/types";

export async function getImportFromFileDescriptor<T = never>(
  descriptor: FileDescriptor
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
    const importName = descriptor.exportName || "default";
    const importedModule = importedFile[importName];

    const fullyResolvedEndpoint = await fullyResolve<T>(importedModule);

    return fullyResolvedEndpoint;
  } catch (error) {
    assertIsError(error);
    return createCoasterError({
      code: "getImportFromFileDescriptor-fileImportError",
      message: `Unexpected error importing file (${filePath})`,
      error,
    });
  }
}
