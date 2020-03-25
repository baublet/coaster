import {
  GraphQLResolverArguments,
  GraphQLTypedResolverDeclaration,
  GraphQLServiceArguments,
  GraphQLType,
  GraphQLReturnStructureNode,
  ReturnNodeToType,
  ArgumentTypeFromArguments
} from "./types";
import { Controller } from "service/controller/types";
import { ServiceType } from "service/types";

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
    ReturnNodeToType<ReturnNode>
  >;
}): GraphQLTypedResolverDeclaration<ResolverArguments, ReturnNode> {
  return {
    description,
    resolver,
    resolutionType,
    resolverArguments
  };
}

// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ! Type tests
// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export const _graphqlServiceArgumentsPrimitiveReturn: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    queries: {
      test: createResolver({
        description: "description",
        resolverArguments: {
          id: {
            type: GraphQLType.STRING,
            nullable: false
          },
          count: {
            type: GraphQLType.INT
          }
        },
        resolutionType: {
          type: GraphQLType.INT
        },
        resolver: async ({ args }) => {
          /**
           * TODO: Make `return args.count` error.
           *
           * This condition should raise an error since count is an
           * optional property on arguments here...
           *
           * return args.count;
           */
          if (args.id) return 2;
          return 1;
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
    queries: {
      test: createResolver({
        description: "description",
        resolverArguments: {
          id: {
            type: GraphQLType.STRING,
            nullable: false
          }
        },
        resolutionType: {
          type: GraphQLType.OBJECT,
          nodes: {
            counter: { type: GraphQLType.INT },
            text: { type: GraphQLType.STRING },
            scalar: { type: GraphQLType.SCALAR },
            nonNullableScalar: {
              type: GraphQLType.SCALAR,
              nullable: false
            },
            nonNullableFloat: {
              type: GraphQLType.FLOAT,
              nullable: false
            }
          }
        },
        resolver: async ({ args }) => {
          return {
            // text: 1 // Fails
            text: args.id,
            nonNullableScalar: "test",
            // nonNullableFloat: "test", // Fails
            nonNullableFloat: 1,
            // counter: {}, // Fails
            counter: 2
          };
        }
      })
    }
  }
};
