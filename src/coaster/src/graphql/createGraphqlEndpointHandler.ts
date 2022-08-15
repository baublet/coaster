import { log } from "../server/log";

log.debug("Loading GraphQL modules");

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

log.debug("GraphQL modules loaded");

type ResolverType<TParent = any, TArgs = any, TContext = any, TInfo = any> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: TInfo
) => any;
interface ResolversObjectType<TContext = RequestContext> {
  Query?: Record<string, ResolverType<any, any, TContext>>;
  Mutation?: Record<string, ResolverType<any, any, TContext>>;
  [key: string]:
    | undefined
    | Record<string, ResolverType<any, any, TContext>>
    | Record<string, Record<string, ResolverType<any, any, TContext>>>;
}

export function createGraphqlEndpointHandler<
  TCreateContext extends (context: RequestContext) => any
>({
  typeDefs,
  resolvers,
  handleError = handleErrorDefault,
  playgroundEnabled = true,
  createContext,
}: {
  typeDefs: string[];
  handleError?: (args: {
    requestContext: RequestContext;
    graphqlContext?: any;
    error: CoasterError;
  }) => void | Promise<void>;
  playgroundEnabled?: boolean;
  createContext: TCreateContext;
  resolvers: ResolversObjectType<ReturnType<TCreateContext>>;
}): EndpointHandler {
  let open = false;
  let openPromise: Promise<void> | undefined;

  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers as any,
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

  return async (requestContext: RequestContext) => {
    if (requestContext.request.method === "get" && playgroundEnabled) {
      const playgroundMiddleware = await getPlaygroundMiddleware();
      playgroundMiddleware(
        requestContext.request._dangerouslyAccessRawRequest(),
        requestContext.response._dangerouslyAccessRawResponse()
      );
      return;
    }

    if (!open) {
      await handleOpen();
    }

    await parseBody(requestContext);

    const isPost = requestContext.request.method === "post";
    if (!isPost) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-method-not-post",
          message: "GraphQL only accepts POST requests",
          details: {
            requestMethod: requestContext.request.method,
            headers: stringify(requestContext.request.headers),
            requestBody: stringify(requestContext.request.body),
          },
        }),
      });
    }

    const isJson =
      requestContext.request.headers.get("content-type")?.toString() ===
      "application/json";
    if (!isJson) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-content-type-not-json",
          message: "GraphQL only accepts content-type: application/json",
          details: {
            requestMethod: requestContext.request.method,
            headers: stringify(requestContext.request.headers),
            requestBody: stringify(requestContext.request.body),
          },
        }),
      });
    }

    const hasRequestBody = Boolean(requestContext.request.body);
    if (!hasRequestBody) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-no-request-body",
          message: "GraphQL requires a request body",
          details: {
            request: stringify(requestContext.request),
          },
        }),
      });
    }

    const requestBody = requestContext.request.body;
    if (isCoasterError(requestBody)) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-error-parsing-request-body",
          message: "Error parsing request body. Body must be valid JSON",
          error: requestBody,
          details: requestContext.request.body,
        }),
      });
    }

    if (typeof requestBody !== "object" || requestBody === null) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-error-parsing-request-body",
          message: "Error parsing request body. Body must be an object",
          error: requestBody,
          details: requestContext.request.body,
        }),
      });
    }

    const requestBodyAsRecord: Record<string, any> = requestBody;

    const graphqlContext = await perform(async () => {
      return (await createContext?.(requestContext)) || requestContext;
    });

    if (isCoasterError(graphqlContext)) {
      return handleError({
        requestContext,
        error: createCoasterError({
          code: "graphql-error-creating-context",
          message: "Error creating context",
          error: graphqlContext,
          details: requestContext.request.body,
        }),
      });
    }

    const result = await perform(() => {
      return server.executeOperation(
        {
          query: requestBodyAsRecord.query,
          operationName: requestBodyAsRecord.operationName,
          variables: requestBodyAsRecord.variables,
        },
        graphqlContext
      );
    });

    if (isCoasterError(result)) {
      return handleError({ graphqlContext, requestContext, error: result });
    }

    const status = requestContext.response.setStatus(
      result.http.statusCode || 200
    );
    if (isCoasterError(status)) {
      return handleError({ graphqlContext, requestContext, error: status });
    }

    const headers = requestContext.response.setHeaders(result.http.headers);
    if (isCoasterError(headers)) {
      return handleError({ graphqlContext, requestContext, error: headers });
    }

    const json = requestContext.response.sendJson(result.result);
    if (isCoasterError(json)) {
      return handleError({ graphqlContext, requestContext, error: json });
    }
  };
}

const error400Codes: string[] = [
  "graphql-error-parsing-request-body",
  "graphql-method-not-post",
  "graphql-error-parsing-request-body",
];
function handleErrorDefault({
  requestContext,
  error,
}: {
  requestContext: RequestContext;
  graphqlContext?: any;
  error: CoasterError;
}) {
  if (error400Codes.includes(error.code)) {
    requestContext.response.setStatus(400);
  } else {
    requestContext.response.setStatus(500);
  }
  if (
    requestContext.request.headers.get("content-type") === "application/json"
  ) {
    requestContext.response.sendJson(error);
  } else {
    requestContext.response.setData(error);
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

let graphqlPlaygroundMiddleware: Promise<any> | undefined;
function getPlaygroundMiddleware() {
  if (!graphqlPlaygroundMiddleware) {
    log.debug("Loading GraphQL Playground middleware");
    graphqlPlaygroundMiddleware = import(
      "graphql-playground-middleware-express"
    ).then((module) => {
      log.debug("GraphQL playground module loaded");
      return module.default({
        endpoint: " ",
        settings: {
          "request.credentials": "include",
        },
      });
    });
  }
  return graphqlPlaygroundMiddleware;
}
