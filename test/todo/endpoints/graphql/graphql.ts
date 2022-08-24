import {
  LazyLoadedHandler,
  createGraphqlEndpointHandler,
} from "@baublet/coaster";

export const handler: LazyLoadedHandler = createGraphqlEndpointHandler({
  createContext: (context) => ({
    ...context,
    hello: "world",
  }),
  typeDefs: [
    `type Query { ping(fail: Boolean = false): PingResponse } type PingResponse { message: String! }`,
  ],
  resolvers: {
    Query: {
      ping: (parent, args: { fail: boolean }, context) => {
        context.log("info", "We made it!");
        if (args.fail) {
          throw new Error("Fail triggered");
        }
        return { message: "pong" };
      },
    },
  },
});
