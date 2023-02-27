import { Request, Response } from "express";

import { createServiceContainer } from "@baublet/service-container";

import { RequestContext } from "./request";
import { getContextLogProperties } from "./getContextLogProperties";

export async function createExpressRequestContext({
  request,
  response,
}: {
  request: Request;
  response: Response;
}): Promise<RequestContext> {
  const serviceContainer = createServiceContainer();

  return {
    ...getContextLogProperties(),
    services: serviceContainer,
    request,
    response,
  };
}
