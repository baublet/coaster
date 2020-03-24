import { ServiceType, ServiceDefaultProperties } from "../types";
import { Controller } from "../controller/types";
import { ModelFactory } from "model";

type GraphQLPrimitiveTypes = {
  type: GraphQLPrimitiveType;
  nullable?: boolean;
};

type GraphQLModelCollectionType = {
  type: GraphQLType.MODEL_COLLECTION;
  modelFactory: ModelFactory;
  nullable?: boolean;
};

type GraphQLArrayOfType = {
  type: GraphQLType.ARRAY_OF;
  values: GraphQLType[];
  nullable?: boolean;
};

type GraphQLObjectType = {
  type: GraphQLType.OBJECT;
  nodes: Record<string, GraphQLReturnStructureNode>;
  nullable?: boolean;
};

export enum GraphQLType {
  ARRAY_OF,
  FLOAT,
  INT,
  MODEL_COLLECTION,
  MODEL,
  OBJECT,
  SCALAR,
  STRING
}

type GraphQLPrimitiveType =
  | GraphQLType.SCALAR
  | GraphQLType.STRING
  | GraphQLType.FLOAT
  | GraphQLType.INT;

export type GraphQLReturnStructureNode =
  | GraphQLPrimitiveTypes
  | GraphQLModelCollectionType
  | GraphQLArrayOfType
  | GraphQLObjectType;

// We omit models and model collections here. They don't make sense as arguments
type GraphQLResolverArgument =
  | GraphQLPrimitiveTypes
  | GraphQLArrayOfType
  | GraphQLObjectType;

export type GraphQLResolverArguments = Record<string, GraphQLResolverArgument>;

export type ArgumentTypeFromArguments<
  T extends GraphQLResolverArguments
> = OptionalNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>> &
  RequiredNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>>;

export interface GraphQLQueryControllerConfiguration<
  ResolverArguments extends GraphQLResolverArguments = any,
  ReturnStructure extends GraphQLReturnStructureNode = any
> {
  description?: string;
  resolver: Controller<ResolverArguments, ReturnStructure>;
  resolverArguments?: GraphQLResolverArguments;
  resolutionType: GraphQLReturnStructureNode;
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

type GraphQLObjectDeclarationNodes = Record<string, GraphQLReturnStructureNode>;

type GraphQLObjectDeclarationTypes<T extends GraphQLObjectDeclarationNodes> = {
  [K in keyof T]: ReturnNodeToType<T[K]>;
};

type GraphQLNodeMapToTypeMapInclusive<
  T extends GraphQLObjectDeclarationNodes
> = {
  [K in keyof T]: ReturnNodeToType<T[K]>;
};

type GraphQLObjectDeclarationToType<
  T extends GraphQLObjectDeclarationNodes
> = RequiredNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>> &
  OptionalNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>>;

type RequiredKeysInNodes<T extends GraphQLObjectDeclarationNodes> = {
  [K in keyof T]: T[K]["nullable"] extends false ? K : never;
}[keyof T];

type OptionalNodes<
  T extends GraphQLObjectDeclarationNodes,
  K extends keyof T
> = Partial<Omit<T, K>>;

type RequiredNodes<
  T extends GraphQLObjectDeclarationNodes,
  K extends keyof T
> = Pick<T, K>;

export type ReturnNodeToType<
  T extends GraphQLReturnStructureNode
> = T extends GraphQLPrimitiveTypes
  ? GraphQLPrimitiveEnumToType<T["type"]>
  : T extends GraphQLObjectType
  ? GraphQLObjectDeclarationToType<T["nodes"]>
  : never;

export type GraphQLTypedResolverDeclaration<
  ResolverArguments extends GraphQLResolverArguments,
  ReturnTypeArgument extends GraphQLReturnStructureNode
> = GraphQLQueryControllerConfiguration<
  ArgumentTypeFromArguments<ResolverArguments>,
  ReturnNodeToType<ReturnTypeArgument>
>;

// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ! Type tests
// ! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Argument type tests

function _argumentTypeFromArgumentsTestFn<T extends GraphQLResolverArguments>(
  args: T
) {
  return (args as any) as ArgumentTypeFromArguments<T>;
}

export const _argumentTypeFromArgumentsTestFnResult: {
  id: string;
  limit?: number;
} = _argumentTypeFromArgumentsTestFn({
  id: {
    type: GraphQLType.STRING,
    nullable: false
  },
  limit: {
    type: GraphQLType.INT
  }
});

// Optional types from nodes

export function _optionalNodesFn<T extends GraphQLObjectDeclarationNodes>(
  declaration: T
): OptionalNodes<GraphQLObjectDeclarationTypes<T>, RequiredKeysInNodes<T>> {
  return (declaration as any) as OptionalNodes<
    GraphQLObjectDeclarationTypes<T>,
    RequiredKeysInNodes<T>
  >;
}

export const _optionalNodeFnReturn: {
  optionalNumber?: number;
  // requiredString: string // This should fail if uncommented
} = _optionalNodesFn({
  requiredString: {
    type: GraphQLType.STRING,
    nullable: false
  },
  optionalNumber: {
    type: GraphQLType.INT
  }
});

// Required types from nodes

export function _requiredNodesFn<T extends GraphQLObjectDeclarationNodes>(
  declaration: T
): GraphQLObjectDeclarationTypes<T> {
  return declaration as GraphQLObjectDeclarationTypes<T>;
}

export const _requiredNodeFnReturn: {
  requiredString: string;
  optionalNumber: number; // This should fail if uncommented
} = _requiredNodesFn({
  requiredString: {
    type: GraphQLType.STRING,
    nullable: false
  },
  optionalNumber: {
    type: GraphQLType.INT
  }
});

// Required keys

type TestAllKeys<T extends object> = {
  [K in keyof T]: K;
}[keyof T];
export const _allKeys: TestAllKeys<{ test: 123; test2: "123" }> = "test";
export const _allKeys2: TestAllKeys<{ test: 123; test2: "123" }> = "test2";

export const _requiredKeysInNode: RequiredKeysInNodes<{
  requiredString: {
    type: GraphQLType.STRING;
    nullable: false;
  };
  optionalString: {
    type: GraphQLType.STRING;
  };
}> = "requiredString";

export function _requiredKeysInNodeFn<T extends GraphQLObjectDeclarationNodes>(
  node: T
): RequiredKeysInNodes<T> {
  return (node as any) as RequiredKeysInNodes<T>;
}

export const _requiredKeysInNodeFnReturn: "requiredString" = _requiredKeysInNodeFn(
  {
    requiredString: {
      type: GraphQLType.STRING,
      nullable: false
    },
    optionalString: {
      type: GraphQLType.STRING
    }
  }
);

// The below should fail if uncommented
//
// export const _requiredKeysInNode2: RequiredKeysInNodes<{
//   requiredString: {
//     type: GraphQLType.STRING;
//     nullable: false;
//   };
//   optionalString: {
//     type: GraphQLType.STRING;
//   };
// }> = "optionalString";

// Required node types
export function _requiredNodeTypes<T extends GraphQLObjectDeclarationNodes>(
  nodes: T
): GraphQLNodeMapToTypeMapInclusive<T> {
  return nodes as GraphQLNodeMapToTypeMapInclusive<T>;
}

export const _requiredNodes: {
  // requiredNumber?: string; // Fails
  requiredNumber: number;
} = _requiredNodeTypes({
  requiredNumber: {
    type: GraphQLType.INT,
    nullable: false
  },
  optionalString: {
    type: GraphQLType.STRING
  }
});

// Return node types from declarations
export function _returnNodeToTypeFn<T extends GraphQLReturnStructureNode>(
  declaration: T
): ReturnNodeToType<T> {
  return declaration as ReturnNodeToType<T>;
}

export const _returnNodeToTypeInt: number = _returnNodeToTypeFn({
  type: GraphQLType.INT
});

export const _returnNodeToTypeScalar: any = _returnNodeToTypeFn({
  type: GraphQLType.SCALAR
});

export const _returnNodeToTypeFloat: number = _returnNodeToTypeFn({
  type: GraphQLType.FLOAT
});

export const _returnNodeToTypeString: string = _returnNodeToTypeFn({
  type: GraphQLType.STRING
});

export const _returnNodeToTypeObject: {
  optionalNumber?: number;
  optionalString?: string;
  requiredNumber: number;
  requiredString: string;
} = _returnNodeToTypeFn({
  type: GraphQLType.OBJECT,
  nodes: {
    optionalNumber: {
      type: GraphQLType.INT
    },
    optionalString: {
      type: GraphQLType.STRING
    },
    requiredString: {
      type: GraphQLType.STRING,
      nullable: false
    },
    requiredNumber: {
      type: GraphQLType.INT,
      nullable: false
    }
  }
});

// Object declaration type

export const graphqlServiceArguments: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    resolvers: {
      test: {
        description: "description",
        resolutionType: {
          type: GraphQLType.OBJECT,
          nodes: {
            totalCount: {
              type: GraphQLType.INT,
              nullable: false
            },
            nodes: {
              type: GraphQLType.INT,
              nullable: false
            }
          }
        },
        // We can't strongly type this without passing it through a function
        resolver: async () => {}
      }
    }
  }
};
