import express from "express";
import http from "http";

import {
  asyncMap,
  createCoasterError,
  fullyResolve,
  CoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";

import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";
import { normalizeEndpoint } from "../endpoints/normalizeEndpoint";
import { ResolvedEndPoint } from "../endpoints/types";
import { NormalizedManifest } from "../manifest/types";
import { Server } from "./types";

export async function createServer(
  manifest: NormalizedManifest
): Promise<Server | CoasterError> {
  const allEndpointDescriptors = manifest.endpoints;

  const endpoints = await asyncMap(allEndpointDescriptors, async (subject) => {
    const unresolvedEndpoint = await getEndpointFromFileDescriptor(subject);
    const fullyResolved = await fullyResolve<CoasterError | ResolvedEndPoint>(
      unresolvedEndpoint
    );
    return fullyResolved;
  });

  const app = express();

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
