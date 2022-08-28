import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

export const endpoint: Endpoint = Promise.resolve({
  endpoint: "/users",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./users")),
});
