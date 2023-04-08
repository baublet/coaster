import { QueryResolvers } from "../../schema.graphql.generated";

export const handler: QueryResolvers["ping"] = () => {
  return "pong";
};
