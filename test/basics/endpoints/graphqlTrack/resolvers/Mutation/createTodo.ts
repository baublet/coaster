import { MutationResolvers } from "../../schema.graphql.generated";

console.log("createTodo code loaded");

export const handler: MutationResolvers["createTodo"] = () => {
  return {
    success: true,
    status: "TODO",
  };
};
