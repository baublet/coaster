import { Endpoint, NormalizedEndpoint } from "./types";

export function createNotFoundEndpoint(
  handler: NormalizedEndpoint["handler"]
): Endpoint {
  return {
    endpoint: "404",
    handler,
  };
}
