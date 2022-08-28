import hash from "node-object-hash";
import { EndpointMiddleware } from "@baublet/coaster";

const hashRequest = hash({
  alg: "sha256",
}).hash;

export const middleware: EndpointMiddleware = (context) => {
  context.log("debug", "Endpoint middleware is working 😉");
  if (context.request.method === "post") {
    const bodyHash = hashRequest({ requestBody: context.request.body });
    context.response.setHeader("X-Query-Hash", bodyHash);
  }
};
