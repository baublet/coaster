import {
  Schema as BaseSchema,
  SchemaNodeType,
  SchemaEntity,
  isSchemaEntityConfiguration,
  SchemaNodeArray,
  SchemaNodeRaw,
} from "./schema";

export interface GenerateTypesFromNodesArguments {
  entities: SchemaEntity[];
}

export interface GenerateTypesBaseArguments {
  initialTypes?: string;
  indent?: string;
}

export type GenerateTypesArguments = GenerateTypesBaseArguments & {
  schema: BaseSchema;
};

export type GenerateTypesArgumentsWithDefaults = Required<
  Omit<GenerateTypesArguments, "initialTypes">
>;

function arrayToTypeDefinition(property: SchemaNodeArray): string {
  switch (property.of) {
    case SchemaNodeType.BOOLEAN:
      return "boolean[]";
    case SchemaNodeType.NUMBER:
      return "number[]";
    case SchemaNodeType.STRING:
      return "string[]";
  }
}

function schemaEntityToTypeDefinition(
  entity: SchemaEntity,
  { indent }: GenerateTypesArgumentsWithDefaults
): string {
  const name = entity.names.pascal;

  const typeParts: string[] = [];
  typeParts.push(`interface ${name} {`);
  const properties = Object.keys(entity.nodes);

  for (const property of properties) {
    const node = entity.nodes[property];

    const propertyParts: string[] = [];
    propertyParts.push(`${indent}${property}`);

    const isNullable = isSchemaEntityConfiguration(node)
      ? Boolean(node.nullable)
      : false;
    if (isNullable) {
      propertyParts.push("?");
    }

    propertyParts.push(": ");

    const type = isSchemaEntityConfiguration(node) ? node.type : node;
    switch (type) {
      case SchemaNodeType.BOOLEAN:
        propertyParts.push("boolean");
        break;
      case SchemaNodeType.NUMBER:
        propertyParts.push("number");
        break;
      case SchemaNodeType.STRING:
        propertyParts.push("string");
        break;
      case SchemaNodeType.ARRAY:
        propertyParts.push(arrayToTypeDefinition(node as SchemaNodeArray));
        break;
      case SchemaNodeType.RAW:
        propertyParts.push((node as SchemaNodeRaw).definition);
        break;
      default:
        throw new Error(`Unknown schema node property type: ${type}`);
    }
    propertyParts.push(";");
    typeParts.push(propertyParts.join(""));
  }

  typeParts.push("}");

  return typeParts.join("\n");
}

export function generatePrimitiveTypes(
  options: GenerateTypesArguments
): string {
  const types: string[] = [];
  const { schema, indent = "  " } = options;

  for (const schemaNode of schema.entities) {
    types.push(
      schemaEntityToTypeDefinition(schemaNode, {
        schema,
        indent,
      })
    );
  }

  return types.join("\n\n");
}
