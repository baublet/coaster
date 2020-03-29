import {
  GraphQLResolverArguments,
  ArgumentTypeFromArguments,
  GraphQLType,
  GraphQLReturnStructureNode,
  ReturnNodeToType,
  GraphQLServiceArguments,
  GraphQLObjectDeclarationNodes,
  OptionalNodes,
  GraphQLObjectDeclarationTypes,
  RequiredKeysInNodes
} from "./types";
import { ServiceType } from "service/types";

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

// export const _requiredKeysInNode2: RequiredKeysInNodes<{
//   requiredString: {
//     type: GraphQLType.STRING;
//     nullable: false;
//   };
//   optionalString: {
//     type: GraphQLType.STRING;
//   };
// }> = "optionalString";

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

const _enumTest = _returnNodeToTypeFn({
  type: GraphQLType.OBJECT,
  nodes: {
    enum: {
      type: GraphQLType.ENUM,
      values: {
        ONE_VALUE: "description",
        TWO_VALUE: "description2"
      }
    }
  }
});

export let _enumTestAssign: typeof _enumTest.enum;
_enumTestAssign = "ONE_VALUE";
_enumTestAssign = "TWO_VALUE";
// _enumTestAssign = "THREE_VALUE"  // Fails

// Object declaration type

export const graphqlServiceArguments: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    queries: {
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
