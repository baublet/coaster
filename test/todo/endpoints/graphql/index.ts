import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const graphqlIndex: Endpoint = {
  endpoint: "/graphql",
  method: ["get", "post"],
  handler: lazyLoadedEndpoint(() => import("./graphql")),
};

export default graphqlIndex;
