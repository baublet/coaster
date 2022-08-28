import { Manifest } from "@baublet/coaster";

export const manifest: Manifest = {
  name: "todo",
  port: "8888",
  notFound: "endpoints/notFound",
  middleware: "middleware/test",
  endpoints: [
    "endpoints/",
    "endpoints/users",
    "endpoints/todos",
    "endpoints/graphql",
    "endpoints/graphqlTrack",
  ],
};
