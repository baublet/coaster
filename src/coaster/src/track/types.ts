import { EndpointInput } from "../endpoints/types";

export interface CoasterTrack extends EndpointInput {
  __isCoasterTrack: true;
}

export function isCoasterTrack(value: any): value is CoasterTrack {
  return value && value?.__isCoasterTrack === true;
}
