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
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import {
  NormalizedEndpointMiddleware,
  ResolvedEndpoint,
  assertIsCoasterInternalEndpoint,
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
import { handleExpressMethodWithHandler } from "./handleExpressMethodWithHandler";
import { maybeInitializeUi } from "./maybeInitializeUi";
import { maybeInitializeNotFound } from "./maybeInitializeNotFound";

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
    assertIsCoasterInternalEndpoint(endpoint);
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

    if (endpoint.dangerouslyApplyMiddleware) {
      const middlewareFunctions = Array.isArray(
        endpoint.dangerouslyApplyMiddleware
      )
        ? endpoint.dangerouslyApplyMiddleware
        : [endpoint.dangerouslyApplyMiddleware];

      for (const applyMiddleware of middlewareFunctions) {
        log.info(`Applying custom middleware for ${endpoint.endpoint}`);
        await applyMiddleware(app);
      }
    }

    for (const uppercaseMethod of endpoint.method) {
      const method = uppercaseMethod.toLowerCase();
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
                if (response.writable === false) {
                  const warningMessage = `Middleware ${middlewareNameHint} flushed the response during an error state, and the response is no longer writable`;
                  log.debug(colors.dim(warningMessage));
                  next(warningMessage);
                  return;
                }

                response.status(500);
                if (
                  request.__coasterRequestContext.request.header(
                    "content-type"
                  ) === "application/json"
                ) {
                  return response.json({
                    error: result.message,
                    code: result.code,
                    details: result.details,
                  });
                }
                response.send(jsonStringify(result));
                return;
              }
              if (request.__coasterRequestContext.response.writable === false) {
                const warningMessage = `Middleware ${middlewareNameHint} flushed the response, and the response is no longer writable`;
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

  const uiResult = await maybeInitializeUi({
    app,
    manifest,
    manifestFullPath,
  });
  if (isCoasterError(uiResult)) {
    return uiResult;
  }

  const notFoundResult = await maybeInitializeNotFound({
    app,
    manifest,
    manifestFullPath,
  });
  if (isCoasterError(notFoundResult)) {
    return notFoundResult;
  }

  maybeWarnIfUiAndNotFoundPresent({ manifest, manifestFullPath });

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

function maybeWarnIfUiAndNotFoundPresent({
  manifest,
  manifestFullPath,
}: {
  manifest: NormalizedManifest;
  manifestFullPath: string;
}) {
  if (manifest.ui && manifest.notFound) {
    log.warn(
      colors.yellow("Warning: ") +
        "Both a UI and a notFound handler are present in the manifest. " +
        colors.dim(
          "The UI will be rendered for all non-matching routes, and thus never render the notFound route."
        )
    );
    log.warn(
      colors.dim(
        ` 🡒 Consider removing the notFound handler from the manifest and handling not found errors in your UI.`
      )
    );
    log.warn(colors.dim(` 🡒 ${manifestFullPath}`));
  }
}

const hashRequest = hash({
  sort: true,
  coerce: true,
});

export async function createRequestContext(
  request: Request,
  response: Response
) {
  const requestId = getRequestIdFromRequestObject(request);
  (request as any).__coasterRequestId = requestId;

  const context = await createExpressRequestContext({
    request,
    response,
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
