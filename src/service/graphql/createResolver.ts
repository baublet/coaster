import {
  GraphQLResolverArguments,
  CompiledGraphQLResolverDeclaration,
  GraphQLReturnStructure,
  ArgumentTypeFromStructure,
  ReturnTypeMapFromStructure,
  GraphQLServiceArguments,
  GraphQLType
} from "./types";
import { Controller } from "service/controller";
import { ServiceType } from "service/types";

/**
 * This function exists entirely to enforce strongly-typed resolvers.
 */
export function createResolver<
  ResolverArguments extends GraphQLResolverArguments,
  ReturnStructure extends GraphQLReturnStructure
>({
  description,
  returnStructure,
  resolverArguments,
  resolver
}: {
  description?: string;
  resolverArguments?: ResolverArguments;
  returnStructure: ReturnStructure;
  resolver: Controller<
    ArgumentTypeFromStructure<ResolverArguments>,
    ReturnTypeMapFromStructure<ReturnStructure>
  >;
}): CompiledGraphQLResolverDeclaration<ResolverArguments, ReturnStructure> {
  return {
    description,
    resolver,
    returnStructure,
    resolverArguments
  };
}

// Type Tests

export const graphqlServiceArguments: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {
      test: createResolver({
        description: "description",
        returnStructure: {
          counter: { type: GraphQLType.INT },
          text: { type: GraphQLType.STRING },
          scalar: { type: GraphQLType.SCALAR },
          nonNullableScalar: {
            type: GraphQLType.SCALAR,
            nullable: false
          }
        },
        resolver: async () => {
          return {
            text: "",
            nonNullableScalar: 1
          };
        }
      })
    }
  }
};
