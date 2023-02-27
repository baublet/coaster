import hash from "node-object-hash";
import { EndpointMiddleware } from "@baublet/coaster";

const hashRequest = hash({
  alg: "sha256",
}).hash;

export const middleware: EndpointMiddleware = (context) => {
  if (context.request.method === "POST") {
    const bodyHash = hashRequest({ requestBody: context.request.body });
    context.response.header("X-Query-Hash", bodyHash);
  }
};
