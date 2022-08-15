import { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "todo",
  port: "8888",
  endpoints: [
    { file: "endpoints/" },
    { file: "endpoints/users" },
    { file: "endpoints/todos" },
    { file: "endpoints/graphql" },
    { file: "endpoints/graphqlTrack" },
  ],
};
