import path from "path";

import { createGraphqlTrack } from "@baublet/coaster";

const graphqlTrack = createGraphqlTrack({
  endpoint: "/graphql-track",
  method: ["get", "post"],
  createContext: (context) => context,
  resolversPath: path.resolve(__dirname, "resolvers"),
  schemaPath: path.resolve(__dirname, "schema.graphql"),
});

export default graphqlTrack;
