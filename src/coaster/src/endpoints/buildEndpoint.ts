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
}: {
  fileDescriptor: FileDescriptor;
  buildTools: BuildTools;
  endpointFileFullPath: string;
}): Promise<undefined | CoasterError> {
  const resolvedEndpoint = await getEndpointFromFileDescriptor({
    fileDescriptor,
    endpointFileFullPath,
  });

  if (isCoasterError(resolvedEndpoint)) {
    return resolvedEndpoint;
  }

  if (resolvedEndpoint.build === undefined) {
    return undefined;
  }

  if (typeof resolvedEndpoint.build !== "function") {
    return createCoasterError({
      code: "buildEndpoint-build-is-not-a-function",
      message: `Endpoint build is not a function`,
      details: { resolvedEndpoint },
    });
  }

  return perform(async () => {
    const result = await resolvedEndpoint?.build?.(buildTools);
    if (isCoasterError(result)) {
      return result;
    }

    if (resolvedEndpoint.buildWatchPatterns) {
      const saveResult = await saveWatchFilesForEndpointDescriptor(
        fileDescriptor.file,
        resolvedEndpoint.buildWatchPatterns
      );
      if (isCoasterError(saveResult)) {
        return saveResult;
      }
    }

    return undefined;
  });
}
