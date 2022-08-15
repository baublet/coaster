import { CoasterError, TypeOrPromiseType } from "@baublet/coaster-utils";

import { EndpointHandler } from "../endpoints/types";

export interface CoasterTrack {
  build: () => TypeOrPromiseType<undefined | CoasterError | void>;
  watchPaths?: string[];
  handler: EndpointHandler;
}
