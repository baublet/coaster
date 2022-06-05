import {
  CoasterError,
  assertIsError,
  createCoasterError,
  fullyResolve,
} from "@baublet/coaster-utils";
import { fileExists } from "@baublet/coaster-fs";

import { FileDescriptor } from "../manifest/types";
import { EndPoint } from "./types";

export async function getEndPointFromFileDescriptor(
  descriptor: FileDescriptor
): Promise<EndPoint | CoasterError> {
  const filePath = descriptor.file;
  const descriptorFileExists = await fileExists(descriptor.file);
  if (!descriptorFileExists) {
    return createCoasterError({
      code: "getEndPointFromFileDescriptor-fileNotFound",
      message: `File not found: ${descriptor.file}. Search path: ${filePath}`,
    });
  }

  try {
    const importedFile = await import(filePath);
    const importName = descriptor.exportName || "default";
    const importedModule = importedFile[importName];

    const fullyResolvedEndpoint = await fullyResolve<EndPoint>(importedModule);

    return fullyResolvedEndpoint;
  } catch (error) {
    assertIsError(error);
    return createCoasterError({
      code: "getEndPointFromFileDescriptor-fileImportError",
      message: `Unexpected error importing file (${filePath})`,
      error,
    });
  }
}
