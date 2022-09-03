import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

import { NormalizedFileDescriptor, FileDescriptor } from "../manifest/types";
import { resolveInputPathFromFile } from "./resolveInputPathFromFile";

export function getNormalizedFileDescriptorFromFileInput({
  fileInput,
  exportNameIfNotSpecified,
  referenceFileFullPath,
}: {
  fileInput: FileDescriptor | string | ((...args: any[]) => any);
  exportNameIfNotSpecified: string;
  referenceFileFullPath: string;
}): NormalizedFileDescriptor | CoasterError {
  let fileName: string | undefined;
  let exportName: string | undefined = undefined;

  if (typeof fileInput === "string") {
    fileName = fileInput;
  } else if (typeof fileInput === "object") {
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

    fileName = fileInput.file;

    if (typeof fileInput.exportName === "string") {
      exportName = fileInput.exportName;
    }
  }

  if (!fileName) {
    return createCoasterError({
      code: "getNormalizedFileDescriptorFromFileInput-file-not-string-or-object",
      message: `Expected file descriptor to be a string or object. Instead received: ${typeof fileInput}`,
      details: {
        fileInput,
        exportNameIfNotSpecified,
        referenceFileFullPath,
      },
    });
  }

  if (fileName.includes("#")) {
    if (exportName) {
      return createCoasterError({
        code: "getNormalizedFileDescriptorFromFileInput-file-and-export-name-specified",
        message: `Cannot specify both file#export and exportName in file descriptor. Please choose one or the other`,
        details: {
          fileInput,
          exportNameIfNotSpecified,
          referenceFileFullPath,
        },
      });
    }

    const [stringFileName, stringExportName] = fileName.split("#");
    fileName = stringFileName;
    exportName = stringExportName;
  }

  if (!exportName) {
    exportName = exportNameIfNotSpecified;
  }

  return {
    file: resolveInputPathFromFile(fileName, referenceFileFullPath),
    exportName,
  };
}
