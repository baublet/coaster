import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const todoIndex: Endpoint = {
  endpoint: "/todos",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./todos")),
};

export default todoIndex;
