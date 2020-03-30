import { ServiceType, ServiceDefaultProperties } from "../types";
import { Controller } from "../controller/types";
import { ModelFactory } from "model";

export type GraphQLPrimitiveTypes = {
  type: GraphQLPrimitiveType;
  nullable?: boolean;
};

export type GraphQLModelCollectionType = {
  type: GraphQLType.MODEL_COLLECTION;
  modelFactory: ModelFactory;
  nullable?: boolean;
};

export type GraphQLArrayOfType = {
  type: GraphQLType.ARRAY_OF;
  value: GraphQLReturnStructureNode;
  nullable?: boolean;
};

export type GraphQLObjectType = {
  type: GraphQLType.OBJECT;
  nodes: Record<string, GraphQLReturnStructureNode>;
  nullable?: boolean;
  name?: string;
  description?: string;
};

type GraphQLEnumFieldsMap = Record<
  string,
  | string
  | {
      deprecationReason?: string;
      description: string;
    }
>;

export type GraphQLEnumType = {
  type: GraphQLType.ENUM;
  nullable?: boolean;
  name?: string;
  description?: string;
  values: GraphQLEnumFieldsMap;
};

export enum GraphQLType {
  ARRAY_OF = "ARRAY_OF",
  BOOLEAN = "BOOLEAN",
  ENUM = "ENUM",
  FLOAT = "FLOAT",
  ID = "ID",
  INT = "INT",
  MODEL_COLLECTION = "MODEL_COLLECTION",
  MODEL = "MODEL",
  OBJECT = "OBJECT",
  SCALAR = "SCALAR",
  STRING = "STRING"
}

export type GraphQLPrimitiveType =
  | GraphQLType.SCALAR
  | GraphQLType.BOOLEAN
  | GraphQLType.STRING
  | GraphQLType.FLOAT
  | GraphQLType.ID
  | GraphQLType.INT;

export type GraphQLReturnStructureNode =
  | GraphQLPrimitiveTypes
  | GraphQLModelCollectionType
  | GraphQLArrayOfType
  | GraphQLObjectType
  | GraphQLEnumType;

// We omit models and model collections here. They don't make sense as arguments
export type GraphQLResolverArgument =
  | GraphQLPrimitiveTypes
  | GraphQLArrayOfType
  | GraphQLObjectType;

export type GraphQLResolverArguments = Record<string, GraphQLResolverArgument>;

export type ArgumentTypeFromArguments<
  T extends GraphQLResolverArguments
> = OptionalNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>> &
  RequiredNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>>;

export type GraphQLReturnStructureRootNode = GraphQLReturnStructureNode & {
  typename?: string;
};

export interface GraphQLQueryControllerConfiguration<
  ResolverArguments extends GraphQLResolverArguments = any,
  ReturnStructure extends GraphQLReturnStructureNode = any
> {
  description?: string;
  resolver: Controller<ResolverArguments, ReturnStructure>;
  resolverArguments?: GraphQLResolverArguments;
  resolutionType: GraphQLReturnStructureRootNode;
}

export type GraphQLQueryOrMutationNode = {
  [key: string]: GraphQLQueryControllerConfiguration;
};

export interface GraphQLServiceOptions {
  queries: GraphQLQueryOrMutationNode;
  mutations?: GraphQLQueryOrMutationNode;
}

export interface GraphQLServiceArguments extends ServiceDefaultProperties {
  type: ServiceType.GRAPHQL;
  options: GraphQLServiceOptions;
}

export type GraphQLPrimitiveEnumToType<
  T extends GraphQLPrimitiveType
> = T extends GraphQLType.STRING
  ? string
  : T extends GraphQLType.SCALAR
  ? any
  : T extends GraphQLType.FLOAT
  ? number
  : T extends GraphQLType.INT
  ? number
  : T extends GraphQLType.ID
  ? string
  : T extends GraphQLType.BOOLEAN
  ? boolean
  : never;

export type GraphQLObjectDeclarationNodes = Record<
  string,
  GraphQLReturnStructureNode
>;

export type GraphQLObjectDeclarationTypes<
  T extends GraphQLObjectDeclarationNodes
> = {
  [K in keyof T]: ReturnNodeToType<T[K]>;
};

export type GraphQLObjectDeclarationToType<
  T extends GraphQLObjectDeclarationNodes
> = RequiredNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>> &
  OptionalNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>>;

export type RequiredKeysInNodes<T extends GraphQLObjectDeclarationNodes> = {
  [K in keyof T]: T[K]["nullable"] extends false ? K : never;
}[keyof T];

export type OptionalNodes<
  T extends GraphQLObjectDeclarationNodes,
  K extends keyof T
> = Partial<Omit<T, K>>;

export type RequiredNodes<
  T extends GraphQLObjectDeclarationNodes,
  K extends keyof T
> = Pick<T, K>;

export type ReturnNodeToType<
  T extends GraphQLReturnStructureNode
> = T extends GraphQLPrimitiveTypes
  ? GraphQLPrimitiveEnumToType<T["type"]>
  : T extends GraphQLObjectType
  ? GraphQLObjectDeclarationToType<T["nodes"]>
  : T extends GraphQLArrayOfType
  ? ReturnNodeToType<T["value"]>[]
  : T extends GraphQLEnumType
  ? keyof T["values"]
  : never;

export type ReturnNodeToTypeOptionality<
  T extends any
> = T["nullable"] extends false ? undefined : T;

export type GraphQLTypedResolverDeclaration<
  ResolverArguments extends GraphQLResolverArguments,
  ReturnTypeArgument extends GraphQLReturnStructureNode
> = GraphQLQueryControllerConfiguration<
  ArgumentTypeFromArguments<ResolverArguments>,
  ReturnNodeToTypeOptionality<ReturnNodeToType<ReturnTypeArgument>>
>;
