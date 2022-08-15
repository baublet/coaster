import path from "path";

import { createGraphqlTrack } from "@baublet/coaster";

export const track = createGraphqlTrack({
  createContext: (context) => context,
  resolversPath: path.resolve(__dirname, "resolvers"),
  schemaPath: path.resolve(__dirname, "schema.graphql"),
});
