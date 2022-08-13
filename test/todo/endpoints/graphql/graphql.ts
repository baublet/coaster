import {
  LazyLoadedHandler,
  createGraphqlEndpointHandler,
} from "@baublet/coaster";

const graphqlHandler: LazyLoadedHandler = createGraphqlEndpointHandler({
  typeDefs: [
    `
    type Query {
      ping: String!
    }
  `,
  ],
  resolvers: {
    Query: {
      ping: () => {
        throw new Error("ruh roh");
        return "pong";
      },
    },
  },
});

export default graphqlHandler;
