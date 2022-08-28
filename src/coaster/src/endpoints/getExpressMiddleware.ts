import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  perform,
} from "@baublet/coaster-utils";
import { RequestHandler } from "express";
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
        await handler(
          context.request._dangerouslyAccessRawRequest(),
          context.response._dangerouslyAccessRawResponse(),
          next
        );
      })
        .then((result) => {
          if (resolved) {
            return;
          }

          if (isCoasterError(result)) {
            resolve(result);
            resolved = true;
            return;
          }

          resolve();
          resolved = true;
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };
}
