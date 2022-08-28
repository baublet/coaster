import { EndpointMiddleware } from "@baublet/coaster";

const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "Manifest-level middleware. Test 2, complete!");
};

export default middleware;
