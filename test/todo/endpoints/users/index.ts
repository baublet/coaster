import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const todoIndex: Endpoint = () => {
  return {
    endpoint: "/users",
    method: "get",
    handler: lazyLoadedEndpoint(async () => await import("./users")),
  };
};

export default todoIndex;
