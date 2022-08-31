import path from "path";

import { createGraphqlTrack } from "@baublet/coaster";

export const endpoint = createGraphqlTrack({
  endpoint: "/graphql-track",
  method: ["get", "post"],
  resolversPath: path.resolve(__dirname, "resolvers"),
  schemaPath: path.resolve(__dirname, "schema.graphql"),
  middleware: [
    "middleware/queryHash",
    {
      file: path.resolve(__dirname, "middleware", "test1"),
      exportName: "default",
    },
    path.resolve(__dirname, "middleware", "test2"),
    "./middleware/test3",
    "./middleware/test4#test4",
  ],
});
