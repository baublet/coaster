import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLInt
} from "graphql";
import {
  GraphQLServiceArguments,
  GraphQLQueryOrMutationNode,
  GraphQLQueryControllerConfiguration,
  GraphQLReturnStructureNode,
  GraphQLType,
  GraphQLObjectType as CoasterGraphQLObjectType
} from "./types";

function primitiveFieldOptions(field: GraphQLReturnStructureNode) {
  switch (field.type) {
    case GraphQLType.FLOAT:
      return {
        type: field.nullable ? GraphQLFloat : new GraphQLNonNull(GraphQLFloat)
      };
    case GraphQLType.STRING:
      return {
        type: field.nullable ? GraphQLString : new GraphQLNonNull(GraphQLString)
      };
    case GraphQLType.INT:
      return {
        type: field.nullable ? GraphQLInt : new GraphQLNonNull(GraphQLInt)
      };
    default:
      throw new Error(`Unsupported GraphQL type: ${field.type}`);
  }
}

export function createSchemaFromDefinition<T extends GraphQLServiceArguments>(
  service: T
): GraphQLSchema {
  const types = {};
  const scalars = {};

  const {
    queries: queryDefinitions,
    mutations: mutationDefinitions
  } = service.options;
  const queryKeys = Object.keys(queryDefinitions);
  const mutationKeys = Object.keys(mutationDefinitions);

  function collateObjectTypes(
    object: CoasterGraphQLObjectType,
    name?: string
  ): GraphQLObjectType {
    if (!name && !object.name) {
      throw new Error(
        "GraphQL object types require a name. This error usually happens when we forget to give a name to root nodes. Otherwise, we infer names based on the object key."
      );
    }

    const typeName = name || object.name;
    if (types[typeName]) return types[typeName];

    const fields = {};
    const fieldKeys = Object.keys(object.nodes);
    fieldKeys.forEach(key => {
      const field = object.nodes[key];
      switch (field.type) {
        case GraphQLType.OBJECT:
          fields[key] = collateObjectTypes(field);
          break;
        default:
          fields[key] = primitiveFieldOptions(field);
      }
    });

    types[typeName] = new GraphQLObjectType({
      name: name || object.name,
      fields
    });

    return types[typeName];
  }

  function collateType(
    key: string,
    { type, nullable }: GraphQLReturnStructureNode
  ) {
    switch (type) {
      case GraphQLType.OBJECT:

      default:
        break;
    }
  }

  function collateRootNode(node: GraphQLQueryControllerConfiguration) {
    const typeKeys = Object.keys(node.resolutionType);
    typeKeys.forEach(typeKey => {
      collateType(typeKey, node.resolutionType[typeKey]);
    });
  }

  queryKeys.forEach(resolver => {});

  return new GraphQLSchema({});
}
