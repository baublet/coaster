import express from "express";
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
import { ResolvedEndPoint } from "../endpoints/types";
import { FileDescriptor, NormalizedManifest } from "../manifest/types";
import { Server } from "./types";

export async function createServer(
  manifest: NormalizedManifest,
  options: {
    beforeEndpointsLoaded?: (
      endpoints: FileDescriptor[]
    ) => Promise<FileDescriptor[]>;
    afterEndpointsLoaded?: (
      endPoints: (CoasterError | ResolvedEndPoint)[]
    ) => Promise<(CoasterError | ResolvedEndPoint)[]>;
  } = {}
): Promise<Server | CoasterError> {
  // console.log({ manifest });

  const allEndpointDescriptors = await withWrappedHook(
    options.beforeEndpointsLoaded,
    manifest.endpoints
  );
  // console.log({ allEndpointDescriptors });

  const resolvedEndpoints = await asyncMap(
    allEndpointDescriptors,
    async (subject) => {
      subject.file = path.resolve(process.cwd(), subject.file);
      return await getEndpointFromFileDescriptor(subject);
    }
  );

  console.log({ resolvedEndpoints });

  const endpoints = await withWrappedHook(
    options.afterEndpointsLoaded,
    resolvedEndpoints
  );

  const app = express();

  for (const endpoint of endpoints) {
    if (isCoasterError(endpoint)) {
      return endpoint;
    }

    console.log({ endpoints });
    const normalizedEndpoint = normalizeEndpoint(endpoint);
    if (isCoasterError(normalizedEndpoint)) {
      return createCoasterError({
        code: "createServer-endpoint-declaration-error",
        message: `Error normalizing endpoint declaration`,
        error: normalizedEndpoint,
      });
    }

    const methodRegistrar = (app as any)[normalizedEndpoint.method];
    if (methodRegistrar === undefined) {
      return createCoasterError({
        code: "createServer-endpoint-method-not-supported",
        message: `Endpoint method ${normalizedEndpoint.method} not supported`,
      });
    }

    // Register the endpoint with express
    methodRegistrar(endpoint.endpoint, endpoint.handler);
  }

  let server: http.Server;

  return {
    start: () => {
      return new Promise((resolve) => {
        const port = manifest.port || 3000;
        server = app.listen(port, () => {
          resolve();
        });
      });
    },
    stop: () => {
      return new Promise((resolve) => {
        server?.close(() => {
          resolve();
        });
      });
    },
  };
}
