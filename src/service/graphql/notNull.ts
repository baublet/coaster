import { GraphQLReturnStructureNode } from "./types";

/**
 * Takes a Coaster GraphQL type and returns a copy of it, but as not null.
 * @param node
 */
export function notNull<T extends GraphQLReturnStructureNode>(
  node: T
): T {
  return Object.assign({}, node, { nullable: false });
}
