import type {
  CoasterError,
  ItemOrArrayOfItems,
  Resolvable,
  TypeOrPromiseType,
} from "@baublet/coaster-utils";

import { BuildTools } from "../build/types";
import type { RequestContext } from "../context/request";
import { FileDescriptor, ModuleMetadata } from "../manifest/types";

export const HTTP_METHODS = [
  "ALL",
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
] as const;
export type HttpMethod = typeof HTTP_METHODS[number];
export const HTTP_METHODS_LOWERCASE = HTTP_METHODS.map((method) =>
  method.toLowerCase()
);

export type EndpointBuildFunction = (
  tools: BuildTools
) => TypeOrPromiseType<undefined | CoasterError | void>;

export interface NormalizedEndpoint {
  endpoint: string;
  method: string[];
  handler: NormalizedEndpointHandler;
  middleware: NormalizedEndpointMiddleware[];
  build: undefined | EndpointBuildFunction;
  buildWatchPatterns: string[];
}

export interface ResolvedEndpoint {
  endpoint: string;
  method: HttpMethod | HttpMethod[];
  handler: NormalizedEndpointHandler;
  middleware: NormalizedEndpointMiddleware[];
  build: undefined | EndpointBuildFunction;
  buildWatchPatterns: string[];
}

export type Endpoint = Resolvable<EndpointInput, ModuleMetadata>;

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
  build?: EndpointBuildFunction;
  /**
   * If your build function relies on specific files, you can specify them here
   * as a list of wildcard patterns. In watch mode, when one or more files matching
   * those patterns change, the endpoint will be rebuilt.
   *
   * Only utilized in development.
   */
  buildWatchPatterns?: string[];
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
