import {
  CoasterError,
  assertIsError,
  createError,
  Resolvable,
  fullyResolve,
} from "@baublet/coaster-utils";
import { readFile, fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest";
import { EndPoint } from "./types";

function a(): number {
  return "a";
}

export async function getEndPointFromFileDescriptor(
  descriptor: FileDescriptor
): Promise<EndPoint | CoasterError> {
  const filePath = descriptor.file;
  const descriptorFileExists = await fileExists(descriptor.file);
  if (!descriptorFileExists) {
    return createError({
      code: "getEndPointFromFileDescriptor-fileNotFound",
      message: `File not found: ${descriptor.file}. Search path: ${filePath}`,
    });
  }

  try {
    const importedFile = await import(filePath);
    const importName = descriptor.exportName || "default";
    const importedModule = importedFile[importName];

    const fullyResolvedEndpoint = await fullyResolve<EndPoint>(importedModule);
    return 1;
    return fullyResolvedEndpoint;
  } catch (error) {
    assertIsError(error);
    return createError({
      code: "getEndPointFromFileDescriptor-fileImportError",
      message: `Unexpected error importing file (${filePath})`,
      error,
    });
  }
}
