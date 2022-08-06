import type { Resolvable } from "@baublet/coaster-utils";

import type { RequestContext } from "../context/request";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | string;

export interface NormalizedEndpoint {
  endpoint: string;
  method: string;
  handler: EndPointHandler;
}

export interface ResolvedEndPoint {
  endpoint: string;
  method?: HttpMethod | HttpMethod[];
  handler: EndPointHandler;
}

export type EndPoint = Resolvable<{
  endpoint: string;
  method?: HttpMethod | HttpMethod[];
  handler: EndPointHandler;
}>;

export type EndPointHandler = (context: RequestContext) => void | Promise<void>;
