import { GraphQLInputObjectType, GraphQLInt } from "graphql";

export const CollectionInput = new GraphQLInputObjectType({
  name: "ModelCollectionInput",
  description: "Filtering, sorting, and pagination for model collections",
  fields: {
    limit: {
      type: GraphQLInt
    },
    offset: {
      type: GraphQLInt
    }
  }
});

export function rootCollectionResolver() {}
