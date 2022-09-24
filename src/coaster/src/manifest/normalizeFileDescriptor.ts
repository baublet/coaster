import {
  asTypeOrError,
  CoasterError,
  createCoasterError,
  isCoasterError,
  jsonStringify,
} from "@baublet/coaster-utils";

import { Manifest, FileDescriptor } from "./types";

export function normalizeFileDescriptor(
  field: Manifest["endpoints"]
): FileDescriptor[] | CoasterError {
  const collapsedEndpoints = collapseTypes(field);

  if (isCoasterError(collapsedEndpoints)) {
    return createCoasterError({
      code: "normalizeFileDescriptor-could-not-collapse-endpoints",
      message: "Could not collapse endpoints into a single file descriptor",
      details: { field },
      previousError: collapsedEndpoints,
    });
  }

  const filesWithoutHashes: FileDescriptor[] = [];
  for (const file of collapsedEndpoints) {
    if (file.file.includes("#")) {
      if (file.exportName) {
        return createCoasterError({
          code: "normalizeFileDescriptor-file-with-hash-and-export-name",
          message: `Expected file descriptor to not contain a hash if export name is specified, but got "${file.file}" with export name "${file.exportName}". Do not do this, even if they match. Use one or the other.`,
        });
      }
      const [fileWithoutHash, hash] = file.file.split("#");
      filesWithoutHashes.push({
        file: fileWithoutHash,
        exportName: hash,
      });
      continue;
    }
    filesWithoutHashes.push(file);
  }

  return filesWithoutHashes;
}

function collapseTypes(
  field: Manifest["endpoints"]
): FileDescriptor[] | CoasterError {
  if (typeof field === "string") {
    return [{ file: field }];
  } else if (Array.isArray(field)) {
    const descriptors: FileDescriptor[] = [];

    for (const descriptor of field) {
      if (typeof descriptor === "string") {
        descriptors.push({ file: descriptor });
      } else {
        const descriptorAsRecord = asTypeOrError("object", descriptor);
        if (isCoasterError(descriptorAsRecord)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-descriptor-not-object-or-string",
            message: `Expected file descriptor to be a string or object, but got a ${typeof descriptor}: ${jsonStringify(
              descriptor
            )}`,
            previousError: descriptorAsRecord,
          });
        }

        const file = asTypeOrError("string", descriptor.file);
        if (isCoasterError(file)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-file-not-string",
            message: `Expected file descriptor file to be a string, but got a ${typeof descriptor.file}: ${jsonStringify(
              descriptor.file
            )}`,
            previousError: file,
          });
        }

        const exportName = descriptor.exportName
          ? asTypeOrError("string", descriptor.exportName)
          : undefined;
        if (isCoasterError(exportName)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-export-name-not-string",
            message: `Expected export name to be a string, but got a ${typeof descriptor.exportName}: ${jsonStringify(
              descriptor.exportName
            )}`,
            previousError: exportName,
          });
        }
        descriptors.push({
          file,
          exportName: descriptor.exportName,
        });
      }
    }

    return descriptors;
  } else if (field && field !== null) {
    const descriptor = field;
    const descriptorAsRecord = asTypeOrError("object", descriptor);
    if (isCoasterError(descriptorAsRecord)) {
      return createCoasterError({
        code: "normalizeFileDescriptor-descriptor-not-object-or-string",
        message: `Expected file descriptor to be a string or object, but got a ${typeof descriptor}: ${jsonStringify(
          descriptor
        )}`,
        previousError: descriptorAsRecord,
      });
    }

    const file = asTypeOrError("string", descriptor.file);
    if (isCoasterError(file)) {
      return createCoasterError({
        code: "normalizeFileDescriptor-file-not-string",
        message: `Expected file descriptor file to be a string, but got a ${typeof descriptor.file}: ${jsonStringify(
          descriptor.file
        )}`,
        previousError: file,
      });
    }

    const exportName = descriptor.exportName
      ? asTypeOrError("string", descriptor.exportName)
      : undefined;
    if (isCoasterError(exportName)) {
      return createCoasterError({
        code: "normalizeFileDescriptor-export-name-not-string",
        message: `Expected export name to be a string, but got a ${typeof descriptor.exportName}: ${jsonStringify(
          descriptor.exportName
        )}`,
        previousError: exportName,
      });
    }

    return [
      {
        file,
        exportName,
      },
    ];
  } else if (field === undefined) {
    return [];
  } else {
    return createCoasterError({
      code: "normalizeFileDescriptor-field-not-string-object-or-array",
      message: `Expected file descriptor to be a string, object, or array, but got "${typeof field}" (${jsonStringify(
        field
      )})`,
    });
  }
}
