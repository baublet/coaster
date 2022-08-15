import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

import { CoasterTrack } from "./types";
import { EndpointHandler } from "../endpoints/types";

export function getTrackHandler<T extends Promise<CoasterTrack | CoasterError>>(
  track: T
): EndpointHandler {
  return async (context) => {
    const resolvedTrack = await track;

    if (isCoasterError(resolvedTrack)) {
      context.response.setStatus(500);
      context.response.setData(JSON.stringify(resolvedTrack));
      return;
    }

    return resolvedTrack.handler(context);
  };
}
