import type { Endpoint } from "@baublet/coaster";
import { createReactTrack } from "@baublet/coaster/react";

export const endpoint: Endpoint = createReactTrack({
  endpoint: "*",
});
