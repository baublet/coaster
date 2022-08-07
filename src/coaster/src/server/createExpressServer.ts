import express, { NextFunction, Request, Response } from "express";
import http from "http";
import path from "path";

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
    async (subject) => {
      subject.file = path.resolve(process.cwd(), subject.file);
      return await getEndpointFromFileDescriptor(subject);
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
      const methodRegistrar = (endpoint: string, handler: Function) =>
        (app as any)[method](endpoint, handler);
      if (methodRegistrar === undefined) {
        return createCoasterError({
          code: "createServer-endpoint-method-not-supported",
          message: `Endpoint method ${normalizedEndpoint.method} not supported`,
        });
      }
      // Register the endpoint with express
      methodRegistrar(
        endpoint.endpoint,
        (request: Request, response: Response, next: NextFunction) =>
          handleExpressMethodWithHandler({
            request,
            response,
            next,
            handler: endpoint.handler,
          })
      );
    }
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
              console.error(error);
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

async function handleExpressMethodWithHandler({
  request,
  response,
  next,
  handler,
}: {
  request: Request;
  response: Response;
  next: NextFunction;
  handler: EndpointHandler;
}): Promise<void> {
  try {
    const context = await createExpressRequestContext({
      request,
      response,
    });
    await handler(context);
    await context.response.flushData();
  } catch {
    // TODO: handle errors
  } finally {
    next();
  }
}
