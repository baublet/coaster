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
  GraphQLEnumValueConfigMap,
  GraphQLInputObjectType
} from "graphql";
import {
  GraphQLServiceArguments,
  GraphQLReturnStructureNode,
  GraphQLType,
  GraphQLObjectType as CoasterGraphQLObjectType,
  GraphQLEnumType as CoasterGraphQLEnumType,
  GraphQLConnectionType,
  GraphQLModelType,
  GraphQLModelConnectionType
} from "./types";
import { ModelArgsPropertyType } from "model/types";
import { isPersistedModelFactory, PersistedModelFactory } from "persist/types";
import {
  connectionInput,
  totalCountResolver,
  modelListResolverFactory,
  defaultRelationshipFactory
} from "./modelConnectionResolvers";

type GraphQLDeclarationMap = {
  objectTypes: Record<string, GraphQLObjectType>;
  enumTypes: Record<string, GraphQLEnumType>;
  inputTypes: Record<string, GraphQLInputObjectType>;
};

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
  const declarationMap: GraphQLDeclarationMap = {
    objectTypes: {},
    enumTypes: {},
    inputTypes: {}
  };

  const {
    queries: queryDefinitions = {}
    // mutations: mutationDefinitions = {}
  } = service.options;
  const queryKeys = Object.keys(queryDefinitions);
  // const mutationKeys = Object.keys(mutationDefinitions);

  /**
   * Turns a model connection into a GraphQL type structure
   */
  function collateModelConnection(
    node: GraphQLModelConnectionType
  ): GraphQLObjectType {
    const typeName = node.name || `${node.modelFactory.name}ModelConnection`;
    const inputName = node.inputName || `${typeName}Input`;

    if (declarationMap.objectTypes[typeName]) {
      return declarationMap.objectTypes[typeName];
    }

    if (!declarationMap.inputTypes[inputName]) {
      declarationMap.inputTypes[inputName] = connectionInput(node.modelFactory);
    }

    declarationMap.objectTypes[typeName] = new GraphQLObjectType({
      name: typeName,
      fields: {
        totalCount: {
          resolve: totalCountResolver,
          type: new GraphQLNonNull(GraphQLInt)
        },
        nodes: {
          resolve: modelListResolverFactory(node.modelFactory),
          type: new GraphQLList(
            new GraphQLNonNull(
              collateModel({
                type: GraphQLType.MODEL,
                modelFactory: node.modelFactory
              })
            )
          )
        }
      }
    });

    return declarationMap.objectTypes[typeName];
  }

  /**
   * Turns an internal connection type into its associated type
   */
  function createConnectionType(
    node: GraphQLConnectionType,
    name?: string
  ): GraphQLObjectType {
    const typeName = name || node.name;

    if (!typeName) {
      throw new Error(
        "GraphQL connection types require a name. This error usually happens when we forget to give a name to root nodes. Otherwise, we infer names based on the object key."
      );
    }

    if (declarationMap.objectTypes[name]) {
      return declarationMap.objectTypes[name];
    }

    return new GraphQLObjectType({
      name: typeName,
      description: node.description,
      fields: {
        totalCount: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        nodes: {
          type: new GraphQLNonNull(new GraphQLList(collateType(node.of)))
        }
      }
    });
  }

  /**
   * Turns a Coaster Model into a GraphQL type
   */
  function collateModel(
    node: GraphQLModelType,
    description?: string
  ): GraphQLObjectType {
    const model = node.modelFactory as PersistedModelFactory;
    const typeName = model.$names.pascal;

    if (declarationMap[typeName]) {
      return declarationMap[typeName];
    }

    const props = model.$options.properties;
    const primaryKey = isPersistedModelFactory(model)
      ? model.$options.persist.primaryKey
      : undefined;
    const fields: Record<string, GraphQLFieldConfig<any, any>> = {};

    for (const key of Object.keys(props)) {
      console.log("KEY: ", key);
      const propOptions = props[key];
      let type;
      let defaultFieldResolver;
      switch (propOptions.type) {
        case ModelArgsPropertyType.BOOLEAN:
          type = GraphQLBoolean;
          break;
        case ModelArgsPropertyType.NUMBER:
          type = GraphQLFloat;
          break;
        case ModelArgsPropertyType.STRING:
          type = GraphQLString;
          break;
      }
      if (key === primaryKey) {
        type = GraphQLID;
      }
      fields[key] = {
        type,
        resolve: node.resolver?.resolver || defaultFieldResolver
      };
    }

    // Collate the relationships
    for (const relationship of model.$relationships) {
      const key = relationship.accessor;
      const type = collateModelConnection({
        type: GraphQLType.MODEL_CONNECTION,
        modelFactory: relationship.modelFactory
      });
      fields[key] = {
        type: relationship.required ? new GraphQLNonNull(type) : type,
        resolve: defaultRelationshipFactory(model, relationship.modelFactory)
      };
    }

    declarationMap[typeName] = new GraphQLObjectType({
      name: model.$names.pascal,
      description,
      fields
    });

    return declarationMap[typeName];
  }

  /**
   * Takes a Coaster GraphQL enum type and converts it into a GraphQL enum
   * class object. Stores them on a global field to prevent duplicates.
   * @param object
   * @param name
   */
  function collateEnum(
    node: CoasterGraphQLEnumType,
    name?: string
  ): GraphQLEnumType {
    if (!name && !node.name) {
      throw new Error(
        "GraphQL enum types require a name. This error usually happens when we forget to give a name to root nodes. Otherwise, we infer names based on the object key."
      );
    }

    const typeName = node.name || name;
    if (declarationMap.enumTypes[typeName])
      return declarationMap.enumTypes[typeName];

    const values: GraphQLEnumValueConfigMap = {};

    for (const [key, config] of Object.entries(node.values)) {
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
    if (declarationMap.objectTypes[typeName])
      return declarationMap.objectTypes[typeName];

    const fields = {};

    for (const key of Object.keys(object.nodes)) {
      const fieldConfig: GraphQLFieldConfig<any, any> = {
        type: collateType(object.nodes[key], key),
        resolve: object.resolver?.resolver
      };
      fields[key] = fieldConfig;
    }

    declarationMap.objectTypes[typeName] = new GraphQLObjectType({
      name: typeName,
      fields,
      description: object.description
    });

    return declarationMap.objectTypes[typeName];
  }

  /**
   * Takes an arbitrary GQL structure definition and returns a valid GraphQL
   * type object.
   * @param node
   * @param key
   */
  function collateType(node: GraphQLReturnStructureNode, key?: string) {
    if ((node as any).localKey) {
      console.trace("wtf -> ", (node as any).localKey);
    }
    let type;
    switch (node.type) {
      case GraphQLType.MODEL:
        type = collateModel(node, node.description);
        break;
      case GraphQLType.MODEL_CONNECTION:
        type = collateModelConnection(node);
        break;
      case GraphQLType.CONNECTION:
        type = createConnectionType(node, key);
        break;
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
  for (const key of queryKeys) {
    const definition = queryDefinitions[key];
    const type = collateType(definition.resolutionType);
    queryFields[key] = {
      type,
      resolve: definition.resolver
    };
  }

  // Step 2: Build the mutation fields
  // TODO

  return new GraphQLSchema({
    types: Object.values(declarationMap.objectTypes),
    query: new GraphQLObjectType({
      name: "Query",
      fields: queryFields
    })
  });
}