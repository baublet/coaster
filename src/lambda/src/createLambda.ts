import path from "path";
import makeLambda, { Handler } from "serverless-http";

import { createExpressServer } from "@baublet/coaster/express";
import { loadRawManifest } from "@baublet/coaster/manifest";
import {
  CoasterError,
  isCoasterError,
  performSync,
} from "@baublet/coaster-utils";

/**
 * Creates a single lambda-style serverless function from a Coaster manifest file.
 * Uses the manifest at `process.cwd() + manifest.ts` by default. If provided, will
 * use that manifest.
 */
export function createLambda(fullPath?: string): Handler {
  const manifestPath = fullPath ?? path.resolve(process.cwd(), "manifest.ts");

  const lambda = new Promise<Handler>((resolve) => {
    loadRawManifest(manifestPath).then((manifest) => {
      if (isCoasterError(manifest)) {
        return resolve(
          getCoasterErrorHandler({
            manifestFullPath: manifestPath,
            error: manifest,
          })
        );
      }
      createExpressServer({
        manifest,
        manifestFullPath: manifestPath,
      }).then((server) => {
        if (isCoasterError(server)) {
          return resolve(
            getCoasterErrorHandler({
              manifestFullPath: manifestPath,
              error: server,
            })
          );
        }
        const express = server.getExpressInstance();

        // Coaster doesn't throw; but `serverless-http` might...
        const lambda = performSync(() => makeLambda(express));
        if (isCoasterError(lambda)) {
          return resolve(
            getCoasterErrorHandler({
              manifestFullPath: manifestPath,
              error: lambda,
            })
          );
        }

        resolve(lambda);
      });
    });
  });

  return async (...args) => {
    const resolvedLambda = await lambda;
    return resolvedLambda(...args);
  };
}

function getCoasterErrorHandler({
  error,
  manifestFullPath,
}: {
  manifestFullPath: string;
  error: CoasterError;
}): Handler {
  return async () => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Unexpected error loading Coaster manifest",
        manifestFullPath,
        error,
      }),
    };
  };
}
