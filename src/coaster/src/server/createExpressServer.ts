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
import { EndpointHandler, ResolvedEndpoint } from "../endpoints/types";
import { FileDescriptor, NormalizedManifest } from "../manifest/types";
import { Server } from "./types";
import { createExpressRequestContext } from "../context/createExpressRequestContext";
import { log } from "../server/log";

export async function createExpressServer(
  manifest: NormalizedManifest,
  options: {
    routeLoadingMode?: "lazy" | "eager";
    beforeEndpointsLoaded?: (
      endpoints: FileDescriptor[]
    ) => Promise<FileDescriptor[]>;
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
  const allEndpointDescriptors = await withWrappedHook(
    options.beforeEndpointsLoaded,
    manifest.endpoints
  );

  const resolvedEndpoints = await asyncMap(
    allEndpointDescriptors,
    (subject) => {
      subject.file = path.resolve(process.cwd(), subject.file);
      return getEndpointFromFileDescriptor(subject);
    }
  );
  const endpoints = await withWrappedHook(
    options.afterEndpointsLoaded,
    resolvedEndpoints.filter(
      (endPointOrLazyLoad) => typeof endPointOrLazyLoad !== "function"
    )
  );

  const app = await withWrappedHook(options.afterExpressLoaded, express());

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
      file: path.resolve(process.cwd(), manifest.notFound.file),
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
      return createCoasterError({
        code: "createServer-not-found-endpoint-declaration-error",
        message: `Error normalizing the not-found (404) endpoint declaration`,
        error: normalizedNotFoundEndpoint,
      });
    }
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
  } catch {
    // TODO: handle errors
  }
}
