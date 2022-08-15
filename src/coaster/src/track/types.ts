import { CoasterError, TypeOrPromiseType } from "@baublet/coaster-utils";

import { EndpointHandler } from "../endpoints/types";

export interface CoasterTrack {
  __isCoasterTrack: true;
  build: () => TypeOrPromiseType<undefined | CoasterError | void>;
  watchPaths?: string[];
  handler: EndpointHandler;
}
