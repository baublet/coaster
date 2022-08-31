import path from "path";

import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

import { NormalizedFileDescriptor, FileDescriptor } from "../manifest/types";
import { resolveInputPathFromFile } from "./resolveInputPathFromFile";

export function getNormalizedFileDescriptorFromFileInput({
  fileInput,
  exportNameIfNotSpecified,
  referenceFileFullPath,
}: {
  fileInput: FileDescriptor | string;
  exportNameIfNotSpecified: string;
  referenceFileFullPath: string;
}): NormalizedFileDescriptor | CoasterError {
  console.log("getNormalizedFileDescriptorFromFileInput", { fileInput });

  if (typeof fileInput === "string") {
    return {
      file: resolveInputPathFromFile(fileInput, referenceFileFullPath),
      exportName: exportNameIfNotSpecified,
    };
  }

  if (typeof fileInput === "object") {
    if (typeof fileInput.file !== "string") {
      return createCoasterError({
        code: "getNormalizedFileDescriptorFromFileInput-file-not-string",
        message: `Expected file descriptor file declaration to be a string, but instead received a ${typeof fileInput.file}`,
        details: {
          fileInput,
          referenceFileFullPath,
        },
      });
    }

    return {
      file: resolveInputPathFromFile(fileInput.file, referenceFileFullPath),
      exportName: fileInput.exportName || exportNameIfNotSpecified,
    };
  }

  return createCoasterError({
    code: "getNormalizedFileDescriptorFromFileInput-file-not-string-or-object",
    message: `Expected file descriptor to be a string or object. Instead received a ${typeof fileInput}`,
    details: {
      fileInput,
      referenceFileFullPath,
    },
  });
}
