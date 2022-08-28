import { EndpointMiddleware } from "@baublet/coaster";

export const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "GraphQL endpoint-level middleware. Test 2, complete!");
};
