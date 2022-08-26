import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import hash from "node-object-hash";

import {
  asyncMap,
  createCoasterError,
  CoasterError,
  isCoasterError,
  withWrappedHook,
} from "@baublet/coaster-utils";

import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import { normalizeEndpoint } from "../endpoints/normalizeEndpoint";
import {
  EndpointHandler,
  NormalizedEndpointMiddleware,
  ResolvedEndpoint,
} from "../endpoints/types";
import { FileDescriptor, NormalizedManifest } from "../manifest/types";
import { Server } from "./types";
import { createExpressRequestContext } from "../context/createExpressRequestContext";
import { log } from "../server/log";
import { getMiddlewareFromFileDescriptor } from "../endpoints/getMiddlewareFromFileDescriptor";
import { RequestContext } from "../context/request";

declare global {
  namespace Express {
    interface Request {
      _coasterRequestContext: RequestContext;
      _coasterRequestId: string;
    }
  }
}

export async function createExpressServer(
  manifest: NormalizedManifest,
  options: {
    routeLoadingMode?: "lazy" | "eager";
    beforeMiddlewareLoaded?: (
      endpoints: FileDescriptor[]
    ) => Promise<FileDescriptor[]>;
    beforeEndpointsLoaded?: (
      endpoints: FileDescriptor[]
    ) => Promise<FileDescriptor[]>;
    afterMiddlewareLoaded?: (
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
): Promise<Server | CoasterError> {
  const middlewareDescriptors = await withWrappedHook(
    options.beforeMiddlewareLoaded,
    manifest.middleware
  );

  const allEndpointDescriptors = await withWrappedHook(
    options.beforeEndpointsLoaded,
    manifest.endpoints
  );

  const resolvedMiddleware = await asyncMap(
    middlewareDescriptors,
    (subject) => {
      subject.file = resolvePath(subject.file);
      subject.exportName = subject.exportName || "middleware";
      return getMiddlewareFromFileDescriptor(subject);
    }
  );
  const middleware = await withWrappedHook(
    options.afterMiddlewareLoaded,
    resolvedMiddleware
  );

  const resolvedEndpoints = await asyncMap(
    allEndpointDescriptors,
    (subject) => {
      subject.file = resolvePath(subject.file);
      subject.exportName = subject.exportName || "endpoint";
      return getEndpointFromFileDescriptor(subject);
    }
  );
  const endpoints = await withWrappedHook(
    options.afterEndpointsLoaded,
    resolvedEndpoints.filter(
      (endPointOrLazyLoad) => typeof endPointOrLazyLoad !== "function"
    )
  );

  const expressInstance = express();

  // The first-stop in every request: creates the Coaster context for the request,
  // attaches it to the request, and adds a request ID to the request.
  expressInstance.use((request, response, next) => {
    createRequestContext(request, response)
      .then(() => {
        next();
      })
      .catch((error) => {
        next(error);
      });
  });

  const app = await withWrappedHook(options.afterExpressLoaded, express());

  for (const middlewareFunction of middleware) {
    if (isCoasterError(middlewareFunction)) {
      return middlewareFunction;
    }
    app.use(async (request, _response, next) => {
      try {
        const result = await middlewareFunction(request._coasterRequestContext);
        if (isCoasterError(result)) {
          return next(result);
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  }

  for (const endpoint of endpoints) {
    if (isCoasterError(endpoint)) {
      return endpoint;
    }

    const normalizedEndpoint = normalizeEndpoint(endpoint);
    if (isCoasterError(normalizedEndpoint)) {
      return createCoasterError({
        code: "createServer-endpoint-declaration-error",
        message: `Error normalizing endpoint declaration`,
        error: normalizedEndpoint,
      });
    }

    for (const method of normalizedEndpoint.method) {
      if ((app as any)[method] === undefined) {
        return createCoasterError({
          code: "createServer-endpoint-method-not-supported",
          message: `Endpoint method ${normalizedEndpoint.method} not supported`,
        });
      }
      const methodRegistrar = (endpoint: string, handler: Function) =>
        (app as any)[method](endpoint, handler);

      // Register the endpoint with express
      methodRegistrar(
        endpoint.endpoint,
        (request: Request, response: Response) =>
          handleExpressMethodWithHandler({
            request,
            response,
            handler: endpoint.handler,
          })
      );
    }
  }

  if (manifest.notFound) {
    const resolvedEndpoint = await getEndpointFromFileDescriptor({
      file: resolvePath(manifest.notFound.file),
      exportName: manifest.notFound.exportName,
    });
    if (!resolvedEndpoint) {
      return createCoasterError({
        code: "createServer-not-found-endpoint-not-found",
        message: `Not found endpoint not found`,
        details: {
          notFound: JSON.stringify(manifest.notFound),
        },
      });
    }

    const normalizedNotFoundEndpoint = normalizeEndpoint(resolvedEndpoint);
    if (isCoasterError(normalizedNotFoundEndpoint)) {
      return normalizedNotFoundEndpoint;
    }

    log.debug("Registering not found endpoint");
    app.use((request, response) => {
      handleExpressMethodWithHandler({
        request,
        response,
        handler: normalizedNotFoundEndpoint.handler,
      });
    });
  }

  let server: http.Server;
  const port = manifest.port || 3000;

  return {
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
              console.error(error);
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
  handler: EndpointHandler;
}): Promise<void> {
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
  try {
    log.debug(`${request.method} ${request.url} [${uniqueRequestHash}]`);
    const context = await createExpressRequestContext({
      request,
      response,
    });
    await handler(context);
    await context.response.flushData();
  } catch (error) {
    log.error("Unexpected error handling request", { error });
    response.status(500).send("Unexpected error");
  }
}

function resolvePath(target: string): string {
  if (target.startsWith("/")) {
    return target;
  }
  return path.resolve(process.cwd(), target);
}

export async function createRequestContext(
  request: Request,
  response: Response
) {
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
  (request as any)._coasterRequestId = uniqueRequestHash;

  const context = await createExpressRequestContext({
    request,
    response,
  });
  (request as any)._coasterRequestContext = context;

  log.debug(`${request.method} ${request.url} [${uniqueRequestHash}]`);

  return context;
}
