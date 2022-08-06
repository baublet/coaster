import { Request, Response } from "express";

import { createServiceContainer } from "@baublet/service-container";

import { createResponseHeadersSentError } from "./createResponseHeadersSentError";
import { RequestContext, CoasterCookieOptions } from "./request";
import { getContextLogProperties } from "./getContextLogProperties";

export async function createExpressRequestContext({
  request,
  response,
}: {
  request: Request;
  response: Response;
}): Promise<RequestContext> {
  const serviceContainer = createServiceContainer();

  const requestHeadersMap = new Map();
  const responseHeadersMap = new Map();
  const responseBuffer: any[] = [];
  const responseCookiesMap = new Map<
    string,
    {
      payload: string;
      options?: CoasterCookieOptions;
    }
  >();

  let responseHeadersSent = false;
  let responseStatus = 200;

  for (const [key, value] of Object.entries(request.headers)) {
    requestHeadersMap.set(key, value);
  }

  return {
    ...getContextLogProperties(serviceContainer),
    request: {
      cookies: request.cookies,
      headers: requestHeadersMap,
      method: request.method,
      body: request.body,
    },
    services: serviceContainer,
    response: {
      appendData: (data) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        responseBuffer.push(data);
      },
      setData: (data) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        responseBuffer.splice(0, responseBuffer.length, data);
      },
      sendJson: (payload) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        responseHeadersMap.set("Content-Type", "application/json");
        responseBuffer.splice(
          0,
          responseBuffer.length,
          JSON.stringify(payload)
        );
      },
      setHeader: (key, payload) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        responseHeadersMap.set(key, payload);
      },
      setHeaders: (headers) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        for (const [key, value] of Object.entries(headers)) {
          responseHeadersMap.set(key, value);
        }
      },
      getHeader: (key) => responseHeadersMap.get(key),
      setStatus: (status) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        responseStatus = status;
      },
      setCookie: (key, payload, options) => {
        if (responseHeadersSent) {
          return createResponseHeadersSentError();
        }
        const cookieOptions = {
          httpOnly: true,
          domain: undefined,
          path: "/",
          ...options,
        };
        responseCookiesMap.set(key, { payload, options: cookieOptions });
      },
      flushData: () => {
        if (!responseHeadersSent) {
          responseHeadersSent = true;
          response.status(responseStatus);
          for (const [key, value] of responseHeadersMap.entries()) {
            response.setHeader(key, value);
          }
          for (const [
            key,
            { payload, options },
          ] of responseCookiesMap.entries()) {
            response.cookie(key, payload, {
              domain: options?.domain,
              path: options?.path,
              httpOnly: options?.httpOnly,
              expires: options?.expiry,
            });
          }
        }
        response.send(responseBuffer);
      },
    },
  };
}
