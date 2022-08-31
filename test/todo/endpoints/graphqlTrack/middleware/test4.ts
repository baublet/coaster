import { EndpointMiddleware } from "@baublet/coaster";

export const test4: EndpointMiddleware = (context) => {
  context.log("debug", "Endpoint-level middleware. Test 4, complete!");
};
