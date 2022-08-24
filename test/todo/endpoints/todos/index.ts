import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

export const endpoint: Endpoint = {
  endpoint: "/todos",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./todos")),
};
