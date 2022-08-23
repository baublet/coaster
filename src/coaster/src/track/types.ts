import { CoasterError, TypeOrPromiseType } from "@baublet/coaster-utils";

import { ResolvedEndpoint } from "../endpoints/types";
import { BuildTools } from "../build/types";

export interface CoasterTrack extends ResolvedEndpoint {
  __isCoasterTrack: true;
  build: (
    tools: BuildTools
  ) => TypeOrPromiseType<undefined | CoasterError | void>;
}

export function isCoasterTrack(value: any): value is CoasterTrack {
  return value && value?.__isCoasterTrack === true;
}
