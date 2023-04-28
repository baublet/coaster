import type { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "todo",
  port: "8888",
  ui: "ui",
  middleware: [
    { file: "middleware/test1" },
    { file: "middleware/test2", exportName: "default" },
    "middleware/test3",
    "middleware/test4",
  ],
  endpoints: [
    "endpoints/",
    { file: "endpoints/users" },
    { file: "endpoints/todos", exportName: "default" },
    "endpoints/graphql",
    "endpoints/graphqlTrack",
  ],
};
