import type { Resolvable } from "@baublet/coaster-utils";

import type { RequestContext } from "../context";

export type ResolvedEndPoint = {
  endpoint: string;
  method?: "get" | "post" | "put" | "delete" | "patch" | string;
  handler: EndPointHandler;
};

export type EndPoint = Resolvable<{
  endpoint: string;
  method?: "get" | "post" | "put" | "delete" | "patch" | string;
  handler: EndPointHandler;
}>;

export type EndPointHandler = (context: RequestContext) => void | Promise<void>;
