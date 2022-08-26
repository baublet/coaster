import type {
  CoasterError,
  Resolvable,
  TypeOrPromiseType,
} from "@baublet/coaster-utils";

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
  /**
   * Route-level middleware applying only to requests to this endpoint
   */
  middleware?:
    | string
    | string[]
    | FileDescriptor
    | FileDescriptor[]
    | EndpointMiddleware
    | EndpointMiddleware[];
}

export type NotFoundEndpoint = Resolvable<{
  handler: EndpointHandler;
}>;

export interface EndpointHandler {
  (context: RequestContext): void | Promise<void>;
}

export interface NormalizedEndpointMiddleware {
  (context: RequestContext): TypeOrPromiseType<void | CoasterError>;
}

export type EndpointMiddleware = Resolvable<NormalizedEndpointMiddleware>;
