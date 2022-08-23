import { CoasterError } from "@baublet/coaster-utils";

import { CoasterTrack } from "./types";
import { logCoasterError } from "../cli/utils/logCoasterError";

export function getFailedTrack({
  error,
  endpoint,
  method,
}: {
  error: CoasterError;
  endpoint: CoasterTrack["endpoint"];
  method?: CoasterTrack["method"];
}): CoasterTrack {
  return {
    __isCoasterTrack: true,
    endpoint,
    method,
    build: () => {
      logCoasterError(error);
      process.exit(1);
    },
    handler: (context) => {
      context.response.setStatus(500);
      context.response.sendJson(JSON.stringify(error));
    },
  };
}
