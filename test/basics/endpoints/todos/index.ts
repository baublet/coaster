import { Endpoint } from "@baublet/coaster";
import { lazyLoadedEndpoint } from "@baublet/coaster/endpoints";

const endpoint: Endpoint = {
  endpoint: "/todos",
  method: "GET",
  handler: lazyLoadedEndpoint(() => import("./todos")),
};

export default endpoint;
