import { EndpointMiddleware } from "@baublet/coaster";

export const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "Manifest-level middleware. Test 3, complete!");
};
