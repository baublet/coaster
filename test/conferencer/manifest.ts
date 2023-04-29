import type { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "conferencer",
  port: "8888",
  middleware: ["middleware/auth"],
  endpoints: ["endpoints/graphql"],
};
