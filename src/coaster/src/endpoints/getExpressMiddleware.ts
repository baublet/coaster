import type { RequestHandler } from "express";

import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  perform,
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { NormalizedEndpointMiddleware } from "./types";

export function getExpressMiddleware(
  handler: RequestHandler
): NormalizedEndpointMiddleware {
  return (context) => {
    let resolved = false;
    return new Promise<void | CoasterError>((resolve) => {
      const next = (error?: any) => {
        if (resolved) {
          // TODO: log this
          return;
        }
        if (error) {
          resolve(
            createCoasterError({
              code: "createExpressMiddleware-middleware returned error",
              message: "Error in Express middleware",
              details: {
                handlerName: handler.name,
                error,
              },
            })
          );
          resolved = true;
          return;
        }
        resolved = true;
        resolve();
      };

      perform(async () => {
        await handler(context.request, context.response, next);
      })
        .then((result) => {
          // The middleware handled things correctly, so we don't need to do anything
          if (resolved) {
            return;
          }

          if (isCoasterError(result)) {
            resolved = true;
            resolve(result);
            return;
          }

          resolved = true;
          resolve();
        })
        .catch(log.error);
    });
  };
}
