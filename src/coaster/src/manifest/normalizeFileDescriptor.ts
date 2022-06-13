import {
  asTypeOrError,
  CoasterError,
  createCoasterError,
  isCoasterError,
  jsonStringify,
} from "@baublet/coaster-utils";
import { Manifest, NormalizedFileDescriptor } from "./types";

export function normalizeFileDescriptor(
  field: Manifest["endpoints"]
): NormalizedFileDescriptor[] | CoasterError {
  if (typeof field === "string") {
    return [{ file: field, exportName: "default" }];
  } else if (Array.isArray(field)) {
    const descriptors: NormalizedFileDescriptor[] = [];

    for (const descriptor of field) {
      if (typeof descriptor === "string") {
        descriptors.push({ file: descriptor, exportName: "default" });
      } else {
        const descriptorAsRecord = asTypeOrError("object", descriptor);
        if (isCoasterError(descriptorAsRecord)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-descriptor-not-object-or-string",
            message: `Expected file descriptor to be a string or object, but got a ${typeof descriptor}: ${jsonStringify(
              descriptor
            )}`,
            error: descriptorAsRecord,
          });
        }

        const file = asTypeOrError("string", descriptor.file);
        if (isCoasterError(file)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-file-not-string",
            message: `Expected file descriptor file to be a string, but got a ${typeof descriptor.file}: ${jsonStringify(
              descriptor.file
            )}`,
            error: file,
          });
        }

        const exportName = descriptor.exportName
          ? asTypeOrError("string", descriptor.exportName)
          : "default";
        if (isCoasterError(exportName)) {
          return createCoasterError({
            code: "normalizeFileDescriptor-export-name-not-string",
            message: `Expected export name to be a string, but got a ${typeof descriptor.exportName}: ${jsonStringify(
              descriptor.exportName
            )}`,
            error: exportName,
          });
        }
        descriptors.push({
          file,
          exportName: descriptor.exportName || "default",
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
        error: descriptorAsRecord,
      });
    }

    const file = asTypeOrError("string", descriptor.file);
    if (isCoasterError(file)) {
      return createCoasterError({
        code: "normalizeFileDescriptor-file-not-string",
        message: `Expected file descriptor file to be a string, but got a ${typeof descriptor.file}: ${jsonStringify(
          descriptor.file
        )}`,
        error: file,
      });
    }

    const exportName = descriptor.exportName
      ? asTypeOrError("string", descriptor.exportName)
      : "default";
    if (isCoasterError(exportName)) {
      return createCoasterError({
        code: "normalizeFileDescriptor-export-name-not-string",
        message: `Expected export name to be a string, but got a ${typeof descriptor.exportName}: ${jsonStringify(
          descriptor.exportName
        )}`,
        error: exportName,
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
