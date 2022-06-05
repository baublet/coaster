import express from "express";
import http from "http";

import {
  collate,
  asyncMap,
  createCoasterError,
  assertIsNotCoasterError,
  fullyResolve,
  CoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";

import { getEndPointFromFileDescriptor } from "../endPoints/getEndPointFromFileDescriptor";
import { ResolvedEndPoint } from "../endPoints/types";
import { Manifest } from "../manifest/types";
import { Server } from "./types";

export async function createServer(
  manifest: Manifest
): Promise<Server | CoasterError> {
  const allEndpointDescriptors = collate(manifest.endPoint, manifest.endPoints);

  const endpoints = await asyncMap(allEndpointDescriptors, async (subject) => {
    const unresolvedEndpoint = await getEndPointFromFileDescriptor(subject);
    const fullyResolved = await fullyResolve<CoasterError | ResolvedEndPoint>(
      unresolvedEndpoint
    );
    return fullyResolved;
  });

  for (const endpoint of endpoints) {
    if (isCoasterError(endpoint)) {
      return endpoint;
    }
  }

  const app = express();

  for (const endpoint of endpoints) {
    assertIsNotCoasterError(endpoint);
    const method = endpoint.method || "all";
    const methodRegistrar = (app as any)[method];
    if (!methodRegistrar) {
      return createCoasterError({
        code: "createServer-invalidMethod",
        message: `Invalid end point method: ${method}`,
        details: {
          endpoint: endpoint.endpoint,
        },
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
