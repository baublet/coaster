import {
  LazyLoadedHandler,
  createGraphqlEndpointHandler,
} from "@baublet/coaster";

const graphqlHandler: LazyLoadedHandler = createGraphqlEndpointHandler({
  createContext: (context) => ({
    ...context,
    hello: "world",
  }),
  typeDefs: [
    `
    type Query {
      ping(fail: Boolean = false): String!
    }
  `,
  ],
  resolvers: {
    Query: {
      ping: (parent, args: { fail: boolean }, context) => {
        context.log("info", "We made it!");
        if (args.fail) {
          throw new Error("Fail triggered");
        }
        return "pong";
      },
    },
  },
});

export default graphqlHandler;
