import type { Resolvable } from "@baublet/coaster-utils";

import type { RequestContext } from "../context/request";

export const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

export interface NormalizedEndpoint {
  endpoint: string;
  method: string[];
  handler: EndpointHandler;
}

export interface ResolvedEndpoint {
  endpoint: string;
  method?: HttpMethod | HttpMethod[];
  handler: EndpointHandler;
}

export type Endpoint = Resolvable<EndpointInput>;

interface EndpointInput {
  endpoint: string;
  method?: "all" | HttpMethod | HttpMethod[];
  handler: EndpointHandler;
}

export type NotFoundEndpoint = Resolvable<{
  handler: EndpointHandler;
}>;

export interface EndpointHandler {
  (context: RequestContext): void | Promise<void>;
}
