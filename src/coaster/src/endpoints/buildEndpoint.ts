import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  perform,
} from "@baublet/coaster-utils";

import { BuildTools } from "../build/types";
import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import { FileDescriptor } from "../manifest/types";
import { saveWatchFilesForEndpointDescriptor } from "../build/watchFilesForEndpointDescriptor";

export async function buildEndpoint({
  fileDescriptor,
  buildTools,
  endpointFileFullPath,
  onHasBuild,
}: {
  fileDescriptor: FileDescriptor;
  buildTools: BuildTools;
  endpointFileFullPath: string;
  onHasBuild?: () => void;
}): Promise<undefined | CoasterError> {
  buildTools.log.debug("Loading endpoint from file descriptor");
  buildTools.setProgress(2, 100);
  const resolvedEndpoint = await getEndpointFromFileDescriptor({
    fileDescriptor,
    endpointFileFullPath,
  });

  if (isCoasterError(resolvedEndpoint)) {
    return createCoasterError({
      code: "buildEndpoint-getEndpointFromFileDescriptorError",
      message: "Unexpected error getting endpoint from file descriptor",
      details: {
        fileDescriptor,
        endpointFileFullPath,
      },
      previousError: resolvedEndpoint,
    });
  }

  if (resolvedEndpoint.build === undefined) {
    return undefined;
  }

  if (typeof resolvedEndpoint.build !== "function") {
    return createCoasterError({
      code: "buildEndpoint-build-is-not-a-function",
      message: `Endpoint build is not a function`,
      details: { fileDescriptor, endpointFileFullPath, resolvedEndpoint },
    });
  }

  onHasBuild?.();

  const result = await perform(async () => {
    const result = await resolvedEndpoint?.build?.(buildTools);
    if (isCoasterError(result)) {
      return createCoasterError({
        code: "buildEndpoint-buildError",
        message: "Unexpected error building endpoint",
        details: {
          fileDescriptor,
          endpointFileFullPath,
        },
        previousError: result,
      });
    }

    if (resolvedEndpoint.buildWatchPatterns) {
      const saveResult = await saveWatchFilesForEndpointDescriptor(
        fileDescriptor.file,
        resolvedEndpoint.buildWatchPatterns
      );
      if (isCoasterError(saveResult)) {
        return createCoasterError({
          code: "buildEndpoint-saveWatchFilesForEndpointDescriptorError",
          message:
            "Unexpected error saving watch files for endpoint descriptor",
          details: {
            fileDescriptor,
            endpointFileFullPath,
          },
          previousError: saveResult,
        });
      }
    }

    return undefined;
  });

  buildTools.setProgress(100, 100);

  return result;
}
