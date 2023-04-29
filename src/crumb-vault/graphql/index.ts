import { createGraphqlTrack } from "@baublet/coaster/graphql";

export const endpoint = createGraphqlTrack({
  endpoint: "/graphql",
  resolversPath: "resolvers",
  schemaPath: "schema.graphql",
  middleware: [],
});
