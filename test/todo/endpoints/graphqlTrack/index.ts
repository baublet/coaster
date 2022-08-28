import path from "path";

import { createGraphqlTrack } from "@baublet/coaster";

export const endpoint = createGraphqlTrack({
  endpoint: "/graphql-track",
  method: ["get", "post"],
  resolversPath: path.resolve(__dirname, "resolvers"),
  schemaPath: path.resolve(__dirname, "schema.graphql"),
  middleware: path.resolve(__dirname, "middleware", "queryHash"),
});
