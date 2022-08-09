import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const todoIndex: Endpoint = {
  endpoint: "/users",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./users")),
};

export default todoIndex;
