import { performance } from "perf_hooks";
import type { Request, Response } from "express";

import { log } from "@baublet/coaster-log-service";
import {
  getErrorLikeStringFromUnknown,
  isCoasterError,
  perform,
} from "@baublet/coaster-utils";

import { createExpressRequestContext } from "../context/createExpressRequestContext";
import { NormalizedEndpointHandler } from "../endpoints/types";

export async function handleExpressMethodWithHandler({
  request,
  response,
  handler,
}: {
  request: Request;
  response: Response;
  handler: NormalizedEndpointHandler;
}): Promise<void> {
  try {
    const context = await perform(async () => {
      if (request.__coasterRequestContext) {
        return request.__coasterRequestContext;
      }
      log.debug("Creating request context");
      return createExpressRequestContext({
        request,
        response,
      });
    });

    if (isCoasterError(context)) {
      log.error("Unexpected error creating context", { context });
      if (!response.headersSent) {
        response.status(500);
      }
      return;
    }

    context.log("debug", "Handling request with primary handler");

    const handlerStartTime = performance.now();
    await handler(context);

    const handlerEndTime = performance.now();
    const elapsedMs = handlerEndTime - handlerStartTime;
    const roundedElapsedTime =
      Math.round((elapsedMs + Number.EPSILON) * 100) / 100;

    context.log("debug", `Request handler complete in ${roundedElapsedTime}ms`);
  } catch (error) {
    log.error("Unexpected error handling request", {
      error: getErrorLikeStringFromUnknown(error),
    });
    if (!response.headersSent) {
      response.status(500);
    }
  }
}
