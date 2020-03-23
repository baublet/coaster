import {
  GraphQLResolverArguments,
  CompiledGraphQLResolverDeclaration,
  GraphQLServiceArguments,
  GraphQLType,
  GraphQLReturnStructureNode,
  ReturnNodeToType
} from "./types";
import { Controller } from "service/controller";
import { ServiceType } from "service/types";

/**
 * This function exists entirely to enforce strongly-typed resolvers.
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
    any,
    //ArgumentTypeFromStructure<ResolverArguments>,
    ReturnNodeToType<ReturnNode>
  >;
}): CompiledGraphQLResolverDeclaration<ResolverArguments, ReturnNode> {
  return {
    description,
    resolver,
    resolutionType,
    resolverArguments
  };
}

// Type Tests

export const _graphqlServiceArgumentsPrimitiveReturn: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {
      test: createResolver({
        description: "description",
        resolverArguments: {},
        resolutionType: {
          type: GraphQLType.INT
        },
        resolver: async () => {
          return 2;
        }
      })
    }
  }
};

export const _graphqlServiceArgumentsComplexReturns: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {
      test: createResolver({
        description: "description",
        resolverArguments: {},
        resolutionType: {
          type: GraphQLType.OBJECT,
          nodes: {
            counter: { type: GraphQLType.INT },
            text: { type: GraphQLType.STRING },
            scalar: { type: GraphQLType.SCALAR },
            nonNullableScalar: {
              type: GraphQLType.SCALAR,
              nullable: false
            }
          }
        },
        resolver: async () => {
          return {
            text: "",
            nonNullableScalar: 1,
            counter: 2
          };
        }
      })
    }
  }
};
