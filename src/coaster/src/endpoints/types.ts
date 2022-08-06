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
