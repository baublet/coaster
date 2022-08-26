import { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "todo",
  port: "8888",
  notFound: "endpoints/notFound",
  middleware: ["middleware/requestId"],
  endpoints: [
    { file: "endpoints/" },
    "endpoints/users",
    { file: "endpoints/todos" },
    { file: "endpoints/graphql" },
    { file: "endpoints/graphqlTrack" },
  ],
};
