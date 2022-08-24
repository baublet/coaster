import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

export const endpoint: Endpoint = {
  endpoint: "/users",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./users")),
};
