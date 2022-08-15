import { CoasterError } from "@baublet/coaster-utils";

import { CoasterTrack } from "./types";
import { logCoasterError } from "../cli/utils/logCoasterError";

export function getFailedTrack(error: CoasterError): CoasterTrack {
  return {
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
