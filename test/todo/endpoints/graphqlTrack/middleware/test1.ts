import { EndpointMiddleware } from "@baublet/coaster";

export const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "Endpoint-level middleware. Test 1, complete!");
};
