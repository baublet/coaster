import { ServiceType, ServiceDefaultProperties } from "../types";
import { Controller } from "../controller";
import { ModelFactory } from "model";
import { ObjectWithoutNeverProperties } from "helperTypes/ObjectWithNeverProperties";

type GraphQLPrimitiveTypes = {
  type: GraphQLPrimitiveType;
  nullable?: false;
};

type GraphQLModelCollectionType = {
  type: GraphQLType.MODEL_COLLECTION;
  modelFactory: ModelFactory;
  nullable?: false;
};

type GraphQLArrayOfType = {
  type: GraphQLType.ARRAY_OF;
  values: GraphQLType[];
  nullable?: false;
};

type GraphQLObjectType = {
  type: GraphQLType.OBJECT;
  nodes: Record<string, typeof GraphQLType>;
  nullable?: false;
};

export enum GraphQLType {
  SCALAR,
  STRING,
  FLOAT,
  INT,
  MODEL_COLLECTION,
  ARRAY_OF,
  OBJECT,
  MODEL
}

type GraphQLPrimitiveType =
  | GraphQLType.SCALAR
  | GraphQLType.STRING
  | GraphQLType.FLOAT
  | GraphQLType.INT;

type GraphQLReturnStructureNode =
  | GraphQLPrimitiveTypes
  | GraphQLModelCollectionType
  | GraphQLArrayOfType
  | GraphQLObjectType;

// We omit models here. Models can't be arguments
type GraphQLResolverArgument =
  | GraphQLPrimitiveType
  | GraphQLArrayOfType
  | GraphQLObjectType;

export type GraphQLReturnStructure = Record<string, GraphQLReturnStructureNode>;
export type GraphQLResolverArguments = Record<string, GraphQLResolverArgument>;

export interface GraphQLQueryControllerConfiguration<
  ResolverArguments extends GraphQLResolverArguments = any,
  ReturnStructure extends GraphQLReturnStructure = any
> {
  description?: string;
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
> = T extends GraphQLType.STRING
  ? string
  : T extends GraphQLType.SCALAR
  ? any
  : T extends GraphQLType.FLOAT
  ? number
  : T extends GraphQLType.INT
  ? number
  : never;

type ReturnStructureNodeToType<
  T extends GraphQLReturnStructureNode
> = T extends GraphQLPrimitiveTypes
  ? GraphQLPrimitiveEnumToType<T["type"]>
  : "tbd";

export type ArgumentTypeFromStructure<T> = {};

type OptionalNodes<T extends GraphQLReturnStructure> = {
  [K in keyof T]?: ReturnStructureNodeToType<T[K]>;
};

type RequiredNodes<
  T extends GraphQLReturnStructure
> = ObjectWithoutNeverProperties<
  {
    [K in keyof T]: T[K]["nullable"] extends undefined | false
      ? ReturnStructureNodeToType<T[K]>
      : never;
  }
>;

export type ReturnTypeMapFromStructure<
  T extends GraphQLReturnStructure
> = OptionalNodes<T> & RequiredNodes<T>;

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
          totalCount: {
            type: GraphQLType.INT,
            nullable: false
          },
          nodes: {
            type: GraphQLType.INT,
            nullable: false
          }
        },
        resolver: async () => {}
      }
    }
  }
};
