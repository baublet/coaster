import {
  GraphQLResolverArguments,
  GraphQLTypedResolverDeclaration,
  GraphQLReturnStructureNode,
  ReturnNodeToType,
  ArgumentTypeFromArguments,
  ReturnNodeToTypeOptionality
} from "./types";
import { Controller } from "service/controller/types";

/**
 * Creates a GraphQL resolver from a specified resolver configuration. Enforces
 * strongly-typed resolvers.
 */
export function createResolver<
  ResolverArguments extends GraphQLResolverArguments,
  ReturnNode extends GraphQLReturnStructureNode
>({
  description,
  resolutionType,
  resolverArguments,
  resolver
}: {
  description?: string;
  resolverArguments?: ResolverArguments;
  resolutionType: ReturnNode;
  resolver: Controller<
    ArgumentTypeFromArguments<ResolverArguments>,
    ReturnNodeToTypeOptionality<ReturnNodeToType<ReturnNode>>
  >;
}): GraphQLTypedResolverDeclaration<ResolverArguments, ReturnNode> {
  return {
    description,
    resolver,
    resolutionType,
    resolverArguments
  };
}
