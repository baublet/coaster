import { EndpointMiddleware } from "@baublet/coaster";

export const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "Manifest middleware working 😊");
};
