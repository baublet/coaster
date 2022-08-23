import { CoasterError, isCoasterError, perform } from "@baublet/coaster-utils";
import { BuildTools } from "../build/types";

import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import { FileDescriptor } from "../manifest/types";
import { isCoasterTrack } from "./types";

export async function buildTrack({
  fileDescriptor,
  buildTools,
}: {
  fileDescriptor: FileDescriptor;
  buildTools: BuildTools;
}): Promise<undefined | CoasterError> {
  const resolvedEndpoint = await getEndpointFromFileDescriptor(fileDescriptor);

  if (isCoasterError(resolvedEndpoint)) {
    return resolvedEndpoint;
  }

  if (!isCoasterTrack(resolvedEndpoint)) {
    return undefined;
  }

  return perform(async () => {
    const result = await resolvedEndpoint?.build(buildTools);
    if (isCoasterError(result)) {
      return result;
    }
    return undefined;
  });
}
