import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const graphqlIndex: Endpoint = {
  endpoint: "/graphql",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./graphql")),
};

export default graphqlIndex;
