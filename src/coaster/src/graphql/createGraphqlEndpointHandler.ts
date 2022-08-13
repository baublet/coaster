import { ApolloServer } from "@apollo/server";
import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  perform,
} from "@baublet/coaster-utils";
import stringify from "safe-json-stringify";
import bodyParser from "body-parser";

import { RequestContext } from "../context/request";
import { EndpointHandler } from "../endpoints/types";

export function createGraphqlEndpointHandler({
  typeDefs,
  resolvers,
  handleError = handleErrorDefault,
}: {
  typeDefs: string[];
  resolvers: any;
  handleError?: (
    context: RequestContext,
    error: CoasterError
  ) => void | Promise<void>;
}): EndpointHandler {
  let open = false;
  let openPromise: Promise<void> | undefined;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  async function handleOpen() {
    if (openPromise) {
      return openPromise;
    }
    openPromise = server.start().then(() => {
      open = true;
    });
    return openPromise;
  }

  return async (context: RequestContext) => {
    if (!open) {
      await handleOpen();
    }

    await parseBody(context);

    const isPost = context.request.method === "post";
    if (!isPost) {
      return handleError(
        context,
        createCoasterError({
          code: "graphql-method-not-post",
          message: "GraphQL only accepts POST requests",
          details: {
            requestMethod: context.request.method,
            headers: stringify(context.request.headers),
            requestBody: stringify(context.request.body),
          },
        })
      );
    }

    const isJson =
      context.request.headers.get("content-type")?.toString() ===
      "application/json";
    if (!isJson) {
      return handleError(
        context,
        createCoasterError({
          code: "graphql-content-type-not-json",
          message: "GraphQL only accepts content-type: application/json",
          details: {
            requestMethod: context.request.method,
            headers: stringify(context.request.headers),
            requestBody: stringify(context.request.body),
          },
        })
      );
    }

    const hasRequestBody = Boolean(context.request.body);
    if (!hasRequestBody) {
      return handleError(
        context,
        createCoasterError({
          code: "graphql-no-request-body",
          message: "GraphQL requires a request body",
          details: {
            request: stringify(context.request),
          },
        })
      );
    }

    const requestBody = context.request.body;
    if (isCoasterError(requestBody)) {
      return handleError(
        context,
        createCoasterError({
          code: "graphql-error-parsing-request-body",
          message: "Error parsing request body. Body must be valid JSON",
          error: requestBody,
          details: context.request.body,
        })
      );
    }

    if (typeof requestBody !== "object" || requestBody === null) {
      return handleError(
        context,
        createCoasterError({
          code: "graphql-error-parsing-request-body",
          message: "Error parsing request body. Body must be an object",
          error: requestBody,
          details: context.request.body,
        })
      );
    }

    const requestBodyAsRecord: Record<string, any> = requestBody;

    const result = await perform(() => {
      return server.executeOperation(
        {
          query: requestBodyAsRecord.query,
          operationName: requestBodyAsRecord.operationName,
          variables: requestBodyAsRecord.variables,
        },
        context
      );
    });

    if (isCoasterError(result)) {
      return handleError(context, result);
    }

    const status = context.response.setStatus(result.http.statusCode || 200);
    if (isCoasterError(status)) {
      return handleError(context, status);
    }

    const headers = context.response.setHeaders(result.http.headers);
    if (isCoasterError(headers)) {
      return handleError(context, headers);
    }

    const json = context.response.sendJson(result.result);
    if (isCoasterError(json)) {
      return handleError(context, json);
    }
  };
}

const error400Codes: string[] = [
  "graphql-error-parsing-request-body",
  "graphql-method-not-post",
  "graphql-error-parsing-request-body",
];
function handleErrorDefault(context: RequestContext, error: CoasterError) {
  if (error400Codes.includes(error.code)) {
    context.response.setStatus(400);
  } else {
    context.response.setStatus(500);
  }
  if (context.request.headers.get("content-type") === "application/json") {
    context.response.sendJson(error);
  } else {
    context.response.setData(error);
  }
}

const handleBodyParsing = bodyParser.json();
function parseBody(context: RequestContext): Promise<void> {
  const request = context.request._dangerouslyAccessRawRequest();
  const response = context.response._dangerouslyAccessRawResponse();
  return new Promise<void>((resolve) => {
    handleBodyParsing(request, response, () => {
      context.request.body = request.body;
      resolve();
    });
  });
}
