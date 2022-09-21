import { Endpoint } from "@baublet/coaster";
import { lazyLoadedEndpoint } from "@baublet/coaster/endpoints";

const endpoint: Endpoint = {
  endpoint: "/todos",
  method: "get",
  handler: lazyLoadedEndpoint(() => import("./todos")),
};

export default endpoint;
