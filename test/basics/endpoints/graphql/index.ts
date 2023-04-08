import { Endpoint } from "@baublet/coaster";
import { lazyLoadedEndpoint } from "@baublet/coaster/endpoints";

export const endpoint: Endpoint = {
  endpoint: "/graphql",
  method: ["GET", "POST"],
  handler: lazyLoadedEndpoint(() => import("./graphql")),
};
