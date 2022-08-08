import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const todoIndex: Endpoint = {
  endpoint: "/users",
  method: "get",
  handler: lazyLoadedEndpoint(async () => await import("./users")),
};

export default todoIndex;
