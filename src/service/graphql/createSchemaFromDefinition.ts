import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLID,
  GraphQLFieldConfig,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLEnumValueConfigMap
} from "graphql";
import {
  GraphQLServiceArguments,
  GraphQLReturnStructureNode,
  GraphQLType,
  GraphQLObjectType as CoasterGraphQLObjectType,
  GraphQLEnumType as CoasterGraphQLEnumType
} from "./types";

function getPrimitiveFieldOptions(field: GraphQLReturnStructureNode) {
  switch (field.type) {
    case GraphQLType.FLOAT:
      return GraphQLFloat;
    case GraphQLType.STRING:
      return GraphQLString;
    case GraphQLType.INT:
      return GraphQLInt;
    case GraphQLType.ID:
      return GraphQLID;
    case GraphQLType.BOOLEAN:
      return GraphQLBoolean;
    default:
      throw new Error(`Unsupported GraphQL type: ${field.type}`);
  }
}

export function createSchemaFromDefinition<T extends GraphQLServiceArguments>(
  service: T
): GraphQLSchema {
  const objectTypes: Record<string, GraphQLObjectType> = {};
  // const scalars = {};
  const enumTypes = {};
  // const interfaces = {};

  const {
    queries: queryDefinitions = {}
    // mutations: mutationDefinitions = {}
  } = service.options;
  const queryKeys = Object.keys(queryDefinitions);
  // const mutationKeys = Object.keys(mutationDefinitions);

  /**
   * Takes a Coaster GraphQL enum type and converts it into a GraphQL enum
   * class object. Stores them on a global field to prevent duplicates.
   * @param object
   * @param name
   */
  function collateEnum(
    enumConfig: CoasterGraphQLEnumType,
    name?: string
  ): GraphQLEnumType {
    if (!name && !enumConfig.name) {
      throw new Error(
        "GraphQL enum types require a name. This error usually happens when we forget to give a name to root nodes. Otherwise, we infer names based on the object key."
      );
    }

    const typeName = enumConfig.name || name;
    if (enumTypes[typeName]) return enumTypes[typeName];

    const values: GraphQLEnumValueConfigMap = {};

    for (const [key, config] of Object.entries(enumConfig.values)) {
      let description: string;
      let deprecationReason: string;
      if (typeof config === "string") {
        description = config;
      } else {
        description = config.description;
        deprecationReason = config.deprecationReason;
      }
      values[key] = {
        description,
        deprecationReason
      };
    }

    return new GraphQLEnumType({
      name: typeName,
      values
    });
  }

  /**
   * Loops through the fields of a Coaster GraphQL object type definition,
   * collates all of the child types (recursively), and returns a fully-formed
   * GraphQLObjectType.
   * @param object
   * @param name
   */
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
      const fieldConfig: GraphQLFieldConfig<any, any> = {
        type: collateType(object.nodes[key], key)
        // TODO: allow field-level resolvers here
      };
      fields[key] = fieldConfig;
    });

    objectTypes[typeName] = new GraphQLObjectType({
      name: typeName,
      fields,
      description: object.description
    });

    return objectTypes[typeName];
  }

  /**
   * Takes an arbitrary GQL structure definition and returns a valid GraphQL
   * type object.
   * @param node
   * @param key
   */
  function collateType(node: GraphQLReturnStructureNode, key?: string) {
    let type;
    switch (node.type) {
      case GraphQLType.OBJECT:
        type = collateObjectTypes(node, key);
        break;
      case GraphQLType.ARRAY_OF:
        type = new GraphQLList(collateType(node.value));
        break;
      case GraphQLType.ENUM:
        type = collateEnum(node, key);
        break;
      default:
        type = getPrimitiveFieldOptions(node);
    }
    return node.nullable === false ? new GraphQLNonNull(type) : type;
  }

  // Step 1: Build the query fields
  const queryFields: Record<string, GraphQLFieldConfig<any, any>> = {};
  queryKeys.forEach(key => {
    const definition = queryDefinitions[key];
    const type = collateType(definition.resolutionType);
    queryFields[key] = {
      type,
      resolve: definition.resolver
    };
  });

  // Step 2: Build the mutation fields

  return new GraphQLSchema({
    types: Object.values(objectTypes),
    query: new GraphQLObjectType({
      name: "Query",
      fields: queryFields
    })
  });
}
