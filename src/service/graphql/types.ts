import { ServiceType, ServiceDefaultProperties } from "../types";
import { Controller } from "../controller";

export type GraphQLReturnStructureType =
  | GraphQLPrimitiveType
  | GraphQLArrayOfType
  | GraphQLModelCollectionType
  | GraphQLObjectType;

type GraphQLModelCollectionType = {
  type: GraphQLComplexType.MODEL_COLLECTION;
  modelFactory: any;
};

type GraphQLArrayOfType = {
  type: GraphQLComplexType.ARRAY_OF;
  values: typeof GraphQLType;
};

type GraphQLObjectType = {
  type: GraphQLComplexType.OBJECT;
  nodes: Record<string, typeof GraphQLType>;
};

enum GraphQLComplexType {
  MODEL_COLLECTION,
  ARRAY_OF,
  OBJECT,
  MODEL
}

enum GraphQLPrimitiveType {
  SCALAR,
  STRING,
  FLOAT,
  INT
}

type GraphQLComplexArguments = GraphQLArrayOfType | GraphQLObjectType;

type GraphQLResolverArgument = GraphQLPrimitiveType | GraphQLComplexArguments;

export const GraphQLType = { ...GraphQLComplexType, ...GraphQLPrimitiveType };

export type GraphQLReturnStructure = Record<string, GraphQLReturnStructureType>;
export type GraphQLResolverArguments = Record<string, GraphQLResolverArgument>;

export interface GraphQLQueryControllerConfiguration<
  ResolverArguments extends GraphQLResolverArguments = any,
  ReturnStructure extends GraphQLReturnStructure = any
> {
  description?: string;
  notNull?: true;
  resolver: Controller<ResolverArguments, ReturnStructure>;
  resolverArguments?: GraphQLResolverArguments;
  returnStructure: GraphQLReturnStructure;
}

export interface GraphQLServiceOptions {
  resolvers: { [key: string]: GraphQLQueryControllerConfiguration };
}

export interface GraphQLServiceArguments extends ServiceDefaultProperties {
  type: ServiceType.GRAPHQL;
  options: GraphQLServiceOptions;
}

type GraphQLPrimitiveEnumToType<
  T extends GraphQLPrimitiveType
> = T extends GraphQLPrimitiveType.STRING
  ? string
  : T extends GraphQLPrimitiveType.SCALAR
  ? any
  : T extends GraphQLPrimitiveType.FLOAT
  ? number
  : T extends GraphQLPrimitiveType.INT
  ? number
  : never;

type StructureNodeToType<
  T extends GraphQLReturnStructureType
> = T extends GraphQLPrimitiveType ? GraphQLPrimitiveEnumToType<T> : never;

export type ArgumentTypeFromStructure<T> = {};

export type ReturnTypeMapFromStructure<T extends GraphQLReturnStructure> = {
  [K in keyof T]: StructureNodeToType<T[K]>;
};

export type CompiledGraphQLResolverDeclaration<
  ResolverArguments extends GraphQLResolverArguments,
  ReturnStructure extends GraphQLReturnStructure
> = GraphQLQueryControllerConfiguration<
  ArgumentTypeFromStructure<ResolverArguments>,
  ReturnTypeMapFromStructure<ReturnStructure>
>;

// Type tests

export const graphqlServiceArguments: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {
      test: {
        description: "description",
        returnStructure: {
          totalCount: GraphQLType.INT,
          nodes: {
            type: GraphQLComplexType.MODEL_COLLECTION,
            modelFactory: 123
          }
        },
        resolver: async () => {}
      }
    }
  }
};
