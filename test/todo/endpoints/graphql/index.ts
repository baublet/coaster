import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

export const endpoint: Endpoint = {
  endpoint: "/graphql",
  method: ["get", "post"],
  handler: lazyLoadedEndpoint(() => import("./graphql")),
};
