import { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "todo",
  port: "8888",
  endPoints: [{ file: "endpoints/index.ts" }],
};
