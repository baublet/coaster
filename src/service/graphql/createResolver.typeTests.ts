import {
  GraphQLServiceArguments,
  GraphQLType,
  GraphQLReturnStructureNode
} from "./types";
import { ServiceType } from "service/types";
import { createResolver } from "./createResolver";

const queryAsAVariable = createResolver({
  description: "Resolver that is a variable",
  resolutionType: {
    type: GraphQLType.STRING
  },
  resolver: async () => {
    return "yo";
  }
});

const typeAsAVariable: GraphQLReturnStructureNode = {
  type: GraphQLType.OBJECT,
  nodes: {
    id: {
      type: GraphQLType.ID,
      nullable: false
    },
    name: {
      type: GraphQLType.STRING
    }
  }
};

export const _graphqlServiceArgumentsPrimitiveReturn: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    queries: {
      queryAsAVariable,
      test: createResolver({
        description: "description",
        resolverArguments: {
          id: {
            type: GraphQLType.STRING,
            nullable: false
          },
          count: {
            type: GraphQLType.INT
          },
          typeAsAVariable
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
            boolean: { type: GraphQLType.BOOLEAN },
            list: {
              type: GraphQLType.ARRAY_OF,
              nullable: false,
              value: {
                type: GraphQLType.BOOLEAN
              }
            },
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
            // text: 1, // Fails
            text: args.id,
            nonNullableScalar: "test",
            // nonNullableFloat: "test", // Fails
            nonNullableFloat: 1,
            // counter: {}, // Fails
            counter: 2,
            list: []
          };
        }
      })
    }
  }
};

export const _graphqlServiceArgumentsComplexReturns2: GraphQLServiceArguments = {
  name: "name",
  port: 82,
  type: ServiceType.GRAPHQL,
  options: {
    queries: {
      test: createResolver({
        description: "description",
        resolutionType: {
          type: GraphQLType.INT,
          nullable: false
        },
        resolverArguments: {
          id: {
            type: GraphQLType.STRING,
            nullable: false
          }
        },
        resolver: async () => {
          return ;
        }
      })
    }
  }
};
