import type {
  CoasterError,
  ItemOrArrayOfItems,
  Resolvable,
  TypeOrPromiseType,
} from "@baublet/coaster-utils";
import { BuildTools } from "../build/types";

import type { RequestContext } from "../context/request";
import { FileDescriptor } from "../manifest/types";

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
  handler: NormalizedEndpointHandler;
  middleware: NormalizedEndpointMiddleware[];
}

export interface ResolvedEndpoint {
  endpoint: string;
  method?: HttpMethod | HttpMethod[];
  handler: NormalizedEndpointHandler;
  middleware?: NormalizedEndpointMiddleware[];
}

export type Endpoint = Resolvable<EndpointInput>;

export interface EndpointInput {
  endpoint: string;
  method?: "all" | HttpMethod | HttpMethod[];
  handler: NormalizedEndpointHandler;
  /**
   * Route-level middleware applying only to requests to this endpoint
   */
  middleware?: ItemOrArrayOfItems<
    string | FileDescriptor | NormalizedEndpointMiddleware
  >;
  build?: (
    tools: BuildTools
  ) => TypeOrPromiseType<undefined | CoasterError | void>;
}

export type NotFoundEndpoint = Resolvable<{
  handler: NormalizedEndpointHandler;
}>;

export interface NormalizedEndpointHandler {
  (context: RequestContext): HandlerReturn;
}

export interface NormalizedEndpointMiddleware {
  (context: RequestContext): HandlerReturn;
}

export type EndpointMiddleware = NormalizedEndpointMiddleware;

export type HandlerReturn = TypeOrPromiseType<CoasterError | any>;
