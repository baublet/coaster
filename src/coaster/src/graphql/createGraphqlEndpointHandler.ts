import { ApolloServer } from "@apollo/server";
import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  jsonParse,
  perform,
} from "@baublet/coaster-utils";
import stringify from "safe-json-stringify";

import { RequestContext } from "../context/request";
import { EndpointHandler } from "../endpoints/types";

export function createGraphqlEndpointHandler<TContext extends RequestContext>({
  typeDefs,
  resolvers,
  handleError = handleErrorDefault,
}: {
  typeDefs: string[];
  resolvers: any;
  handleError: (context: TContext, error: CoasterError) => void | Promise<void>;
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

  return async (context: any) => {
    if (!open) {
      await handleOpen();
    }

    const isPost = context.request.method === "post";
    if (!isPost) {
      return handleError(
        context,
        createCoasterError({
          code: "graphqlTrack-method-not-post",
          message: "GraphQL tracks only accepts POST requests",
          details: {
            requestMethod: context.request.method,
            headers: stringify(context.request.headers),
            requestBody: stringify(context.request.body),
          },
        })
      );
    }

    const isJson =
      context.request.headers.get("Content-Type") === "application/json";
    if (!isJson) {
      return handleError(
        context,
        createCoasterError({
          code: "graphqlTrack-content-type-not-json",
          message: "GraphQL tracks only accepts Content-Type: application/json",
          details: {
            requestMethod: context.request.method,
            headers: stringify(context.request.headers),
            requestBody: stringify(context.request.body),
          },
        })
      );
    }

    const requestBody = jsonParse(context.request.body);
    if (isCoasterError(requestBody)) {
      return handleError(
        context,
        createCoasterError({
          code: "graphqlTrack-error-parsing-request-body",
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
          code: "graphqlTrack-error-parsing-request-body",
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

function handleErrorDefault(context: RequestContext, error: CoasterError) {
  context.response.setStatus(500);
  context.response.sendJson(error);
}
