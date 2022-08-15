import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const graphqlIndex: Endpoint = {
  endpoint: "/graphqlTrack",
  method: ["get", "post"],
  handler: lazyLoadedEndpoint(() => import("./graphqlTrack")),
};

export default graphqlIndex;
