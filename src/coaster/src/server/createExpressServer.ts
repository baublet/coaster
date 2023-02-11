import express, {
  Handler,
  NextFunction,
  Request,
  Response,
  Express,
} from "express";
import http from "http";
import hash from "node-object-hash";
import colors from "@colors/colors";

import {
  asyncMap,
  createCoasterError,
  CoasterError,
  isCoasterError,
  withWrappedHook,
  jsonStringify,
  isInvocable,
  perform,
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import {
  NormalizedEndpointHandler,
  NormalizedEndpointMiddleware,
  ResolvedEndpoint,
} from "../endpoints/types";
import {
  NormalizedFileDescriptor,
  NormalizedManifest,
} from "../manifest/types";
import { ExpressServer } from "./types";
import { createExpressRequestContext } from "../context/createExpressRequestContext";
import { getMiddlewareFromFileDescriptor } from "../endpoints/getMiddlewareFromFileDescriptor";
import { RequestContext } from "../context/request";
import { resolveInputPathFromFile } from "../common/resolveInputPathFromFile";
import { COASTER_REQUEST_ID_HEADER_NAME } from "../common/coasterRequestId";
import { performance } from "perf_hooks";

declare global {
  namespace Express {
    interface Request {
      __coasterRequestContext: RequestContext;
      __coasterRequestId: string;
    }
  }
}

export async function createExpressServer(
  {
    manifest,
    manifestFullPath,
    expressInstance = express(),
  }: {
    manifest: NormalizedManifest;
    manifestFullPath: string;
    expressInstance?: Express;
  },
  options: {
    routeLoadingMode?: "lazy" | "eager";
    beforeManifestMiddlewareLoaded?: (
      endpoints: NormalizedFileDescriptor[]
    ) => Promise<NormalizedFileDescriptor[]>;
    beforeEndpointsLoaded?: (
      endpoints: NormalizedFileDescriptor[]
    ) => Promise<NormalizedFileDescriptor[]>;
    afterManifestMiddlewareLoaded?: (
      middleware: (CoasterError | NormalizedEndpointMiddleware)[]
    ) => Promise<(CoasterError | NormalizedEndpointMiddleware)[]>;
    afterEndpointsLoaded?: (
      endPoints: (CoasterError | ResolvedEndpoint)[]
    ) => Promise<(CoasterError | ResolvedEndpoint)[]>;
    afterExpressLoaded?: (app: express.Express) => Promise<express.Express>;
    afterServerStart?: (args: {
      port: string | number;
      application: express.Express;
      server: http.Server;
    }) => Promise<void>;
    afterServerStop?: (args: {
      port: string | number;
      application: express.Express;
      server: http.Server;
    }) => Promise<void>;
  } = {}
): Promise<ExpressServer | CoasterError> {
  const middlewareDescriptors = await withWrappedHook(
    options.beforeManifestMiddlewareLoaded,
    manifest.middleware
  );

  const allEndpointDescriptors = await withWrappedHook(
    options.beforeEndpointsLoaded,
    manifest.endpoints
  );

  const resolvedMiddleware = await asyncMap(
    middlewareDescriptors,
    async (subject) => {
      if (isInvocable(subject)) {
        return subject;
      }
      return getMiddlewareFromFileDescriptor(subject);
    }
  );

  const middleware = await withWrappedHook(
    options.afterManifestMiddlewareLoaded,
    resolvedMiddleware
  );

  const resolvedEndpoints = await asyncMap(
    allEndpointDescriptors,
    async (subject) => {
      if (isInvocable(subject)) {
        return subject();
      }
      const resolvedFile = resolveInputPathFromFile(
        subject.file,
        manifestFullPath
      );
      return getEndpointFromFileDescriptor({
        fileDescriptor: subject,
        endpointFileFullPath: resolvedFile,
      });
    }
  );

  const endpoints = await withWrappedHook(
    options.afterEndpointsLoaded,
    resolvedEndpoints
  );

  // The first-stop in every request: creates the Coaster context for the request,
  // attaches it to the request, and adds a request ID to the request, if one does
  // not already exist.
  expressInstance.use((request, response, next) => {
    createRequestContext(request, response)
      .then((context) => {
        request.__coasterRequestContext = context;
        next();
      })
      .catch((error) => {
        next(error);
      });
  });

  const app = await withWrappedHook(
    options.afterExpressLoaded,
    expressInstance
  );

  for (const middlewareFunction of middleware) {
    if (isCoasterError(middlewareFunction)) {
      return middlewareFunction;
    }
    app.use(async (request, _response, next) => {
      try {
        const result: any = await middlewareFunction(
          request.__coasterRequestContext
        );
        if (isCoasterError(result)) {
          return next(result);
        }
        next();
      } catch (error) {
        log.error(error);
        next(error);
      }
    });
  }

  for (const endpoint of endpoints) {
    if (isCoasterError(endpoint)) {
      return createCoasterError({
        code: "createExpressServer-unexpected-error-loading-endpoint",
        message: `Error loading one or more endpoints from ${manifestFullPath}`,
        details: {
          endpoint,
          manifestFullPath,
        },
        previousError: endpoint,
      });
    }
    for (const method of endpoint.method) {
      if ((app as any)[method] === undefined) {
        return createCoasterError({
          code: "createServer-endpoint-method-not-supported",
          message: `Endpoint method ${endpoint.method} not supported`,
        });
      }
      const methodRegistrar = ({
        endpoint,
        handler,
        middleware,
      }: {
        endpoint: string;
        handler: Function;
        middleware: Handler[];
      }) => (app as any)[method](endpoint, ...middleware, handler);

      const aggregatedMiddleware: Handler[] = [];
      if (endpoint.middleware.length > 0) {
        log.debug(`Registering middleware (${method}) ${endpoint.endpoint}`);
        for (const endpointMiddlewareFunction of endpoint.middleware) {
          const middlewareNameHint =
            (endpointMiddlewareFunction as any)?.__coasterMiddlewareNameHint ||
            "anonymous fn";
          log.debug(colors.dim(middlewareNameHint));
          aggregatedMiddleware.push(async function dynamicMiddlewareHandler(
            request: Request,
            _response: unknown,
            next: NextFunction
          ) {
            try {
              const result = await endpointMiddlewareFunction(
                request.__coasterRequestContext
              );
              if (isCoasterError(result)) {
                request.__coasterRequestContext.log(
                  "error",
                  "Unexpected error executing endpoint middleware",
                  { result }
                );
                const response = request.__coasterRequestContext.response;
                if (response.hasFlushed()) {
                  const warningMessage = `Middleware ${middlewareNameHint} flushed the response`;
                  log.debug(colors.dim(warningMessage));
                  next(warningMessage);
                  return;
                }

                response.setStatus(500);
                if (
                  request.__coasterRequestContext.request.headers.get(
                    "content-type"
                  ) === "application/json"
                ) {
                  return response.sendJson({
                    error: result.message,
                    code: result.code,
                    details: result.details,
                  });
                }
                response.setData(jsonStringify(result));
                return response.flushData();
              }
              if (request.__coasterRequestContext.response.hasFlushed()) {
                const warningMessage = `Middleware ${middlewareNameHint} flushed the response`;
                log.debug(colors.dim(warningMessage));
                next(warningMessage);
                return;
              }
              next(result);
            } catch (error) {
              next(error);
            }
          });
        }
      }

      // Register the endpoint with express
      methodRegistrar({
        endpoint: endpoint.endpoint,
        middleware: aggregatedMiddleware,
        handler: (request: Request, response: Response) => {
          return handleExpressMethodWithHandler({
            request,
            response,
            handler: endpoint.handler,
          });
        },
      });
    }
  }

  if (manifest.notFound) {
    const notFoundFullPath = resolveInputPathFromFile(
      manifest.notFound.file,
      manifestFullPath
    );
    const resolvedNotFoundEndpoint = await getEndpointFromFileDescriptor({
      fileDescriptor: {
        file: notFoundFullPath,
        exportName: manifest.notFound.exportName,
      },
      endpointFileFullPath: notFoundFullPath,
    });
    if (!resolvedNotFoundEndpoint) {
      return createCoasterError({
        code: "createServer-not-found-endpoint-not-found",
        message: `Not found endpoint not found`,
        details: {
          notFound: JSON.stringify(manifest.notFound),
        },
      });
    }

    if (isCoasterError(resolvedNotFoundEndpoint)) {
      return createCoasterError({
        code: "createExpressServer-unexpected-error-loading-not-found-endpoint",
        message: `Error loading not found endpoint from ${manifestFullPath}`,
        details: { manifestFullPath },
        previousError: resolvedNotFoundEndpoint,
      });
    }

    log.debug(colors.dim("Registering not found endpoint"));
    app.use((request, response) => {
      handleExpressMethodWithHandler({
        request,
        response,
        handler: resolvedNotFoundEndpoint.handler,
      });
    });
  }

  let server: http.Server;
  const port = manifest.port || 3000;

  return {
    getExpressInstance: () => app,
    start: () => {
      return new Promise((resolve) => {
        server = app.listen(port, async () => {
          options
            .afterServerStart?.({ port, application: app, server })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              log.error(error);
              resolve(error);
            });
        });
      });
    },
    stop: () => {
      return new Promise((resolve) => {
        server?.close(() => {
          options
            .afterServerStop?.({ port, application: app, server })
            .then(() => {
              resolve();
            })
            .catch((error) => {
              log.error(error);
              resolve(error);
            });
        });
      });
    },
  };
}

const hashRequest = hash({
  sort: true,
  coerce: true,
});
async function handleExpressMethodWithHandler({
  request,
  response,
  handler,
}: {
  request: Request;
  response: Response;
  handler: NormalizedEndpointHandler;
}): Promise<void> {
  try {
    const requestId = getRequestIdFromRequestObject(request);

    const context = await perform(async () => {
      if (request.__coasterRequestContext) {
        return request.__coasterRequestContext;
      }
      log.debug("Creating request context");
      return createExpressRequestContext({
        request,
        response,
        requestId,
      });
    });
    if (isCoasterError(context)) {
      log.error("Unexpected error handling request", { context });
      response.status(500).send("Unexpected error");
      return;
    }

    context.log("debug", "Handling request with primary handler");
    const handlerStartTime = performance.now();
    await handler(context);
    if (!context.response.hasFlushed()) {
      await context.response.flushData();
    }
    const handlerEndTime = performance.now();
    const elapsedMs = handlerEndTime - handlerStartTime;
    const roundedElapsedTime =
      Math.round((elapsedMs + Number.EPSILON) * 100) / 100;
    context.log("debug", `Request handler complete in ${roundedElapsedTime}ms`);
  } catch (error) {
    log.error("Unexpected error handling request", { error });
    response.status(500).send("Unexpected error");
  }
}

export async function createRequestContext(
  request: Request,
  response: Response
) {
  const requestId = getRequestIdFromRequestObject(request);
  (request as any).__coasterRequestId = requestId;

  const context = await createExpressRequestContext({
    request,
    response,
    requestId,
  });
  (request as any).__coasterRequestContext = context;

  log.debug(`${request.method} ${request.url} [${requestId}]`);

  return context;
}

function getRequestIdFromRequestObject(request: Request): string {
  let requestId: string = "";

  const userSuppliedRequestId = request.headers[COASTER_REQUEST_ID_HEADER_NAME];
  if (userSuppliedRequestId && typeof userSuppliedRequestId === "string") {
    requestId = userSuppliedRequestId;
  } else {
    const requestIncomingTime = Date.now();
    const uniqueRequestHash = hashRequest.hash({
      time: requestIncomingTime,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        query: request.query,
        protocol: request.protocol,
        originalUrl: request.originalUrl,
      },
    });
    requestId = uniqueRequestHash;
  }

  return requestId;
}
