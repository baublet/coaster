import { GraphQLReturnStructureNode } from "./types";

export function createType<T extends GraphQLReturnStructureNode>(
  typeDef: T
): T {
  return typeDef;
}
