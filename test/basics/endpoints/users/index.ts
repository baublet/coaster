import { Endpoint } from "@baublet/coaster";
import { lazyLoadedEndpoint } from "@baublet/coaster/endpoints";

export const endpoint: Endpoint = Promise.resolve({
  endpoint: "/users",
  method: "GET",
  handler: lazyLoadedEndpoint(() => import("./users")),
});
