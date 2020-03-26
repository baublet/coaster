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
  GraphQLInt,
  GraphQLNamedType,
  GraphQLID,
  GraphQLFieldConfig
} from "graphql";
import {
  GraphQLServiceArguments,
  GraphQLQueryOrMutationNode,
  GraphQLQueryControllerConfiguration,
  GraphQLReturnStructureNode,
  GraphQLType,
  GraphQLObjectType as CoasterGraphQLObjectType
} from "./types";

function getPrimitiveFieldOptions(field: GraphQLReturnStructureNode) {
  switch (field.type) {
    case GraphQLType.FLOAT:
      return {
        type:
          field.nullable === false
            ? new GraphQLNonNull(GraphQLFloat)
            : GraphQLFloat
      };
    case GraphQLType.STRING:
      return {
        type:
          field.nullable === false
            ? new GraphQLNonNull(GraphQLString)
            : GraphQLString
      };
    case GraphQLType.INT:
      return {
        type:
          field.nullable === false ? new GraphQLNonNull(GraphQLInt) : GraphQLInt
      };
    case GraphQLType.ID:
      return {
        type:
          field.nullable === false ? new GraphQLNonNull(GraphQLID) : GraphQLInt
      };
    default:
      throw new Error(`Unsupported GraphQL type: ${field.type}`);
  }
}

export function createSchemaFromDefinition<T extends GraphQLServiceArguments>(
  service: T
): GraphQLSchema {
  const objectTypes: Record<string, GraphQLObjectType> = {};
  const scalars = {};
  const enums = {};
  const interfaces = {};
  const lists = {};

  const {
    queries: queryDefinitions = {},
    mutations: mutationDefinitions = {}
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

    const typeName = object.name || name;
    if (objectTypes[typeName]) return objectTypes[typeName];

    const fields = {};

    const fieldKeys = Object.keys(object.nodes);
    fieldKeys.forEach(key => {
      const field = object.nodes[key];
      switch (field.type) {
        case GraphQLType.OBJECT:
          console.log("Object type");
          fields[key] = collateObjectTypes(field);
          if (field.nullable) {
            fields[key] = new GraphQLNonNull(fields[key]);
          }
          break;
        default:
          fields[key] = getPrimitiveFieldOptions(field);
      }
    });

    objectTypes[typeName] = new GraphQLObjectType({
      name: typeName,
      fields,
      description: object.description
    });

    return objectTypes[typeName];
  }

  function collateType(key: string, node: GraphQLReturnStructureNode) {
    switch (node.type) {
      case GraphQLType.OBJECT:
        collateObjectTypes(node, key);
        break;
      default:
        break;
    }
  }

  const queryFields: Record<string, GraphQLFieldConfig<any, any>> = {};
  queryKeys.forEach(key => {
    const def = queryDefinitions[key];
    collateType(undefined, def.resolutionType);
    const resolutionType = def.resolutionType;
    switch (resolutionType.type) {
      case GraphQLType.OBJECT:
        const returnTypeName = resolutionType.name;
        queryFields[key] = {
          type: objectTypes[returnTypeName],
          resolve: def.resolver
        };
    }
  });

  console.log("OBJECT TYPES: ", objectTypes);

  return new GraphQLSchema({
    types: Object.values(objectTypes),
    query: new GraphQLObjectType({
      name: "Query",
      fields: queryFields
    })
  });
}
