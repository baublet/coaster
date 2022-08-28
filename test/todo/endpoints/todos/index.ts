import { Endpoint, lazyLoadedEndpoint } from "@baublet/coaster";

const endpoint: Endpoint = {
  endpoint: "/todos",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./todos")),
};

export default endpoint;
