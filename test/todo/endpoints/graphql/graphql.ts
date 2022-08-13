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
      ping: () => "pong",
    },
  },
});

export default graphqlHandler;
