import {
  Schema,
  SchemaNodeType,
  SchemaEntity,
  isSchemaEntityConfiguration
} from "./schema";

export interface GenerateTypesFromNodesArguments {
  entities: SchemaEntity[];
}

export interface GenerateTypesArguments {
  schema: Schema;
}

function schemaEntityToTypeDefinition(entity: SchemaEntity): string {
  const name = entity.names.pascal;

  const typeParts: string[] = [];
  typeParts.push(`interface ${name} {`);
  const properties = Object.keys(entity.nodes);

  for (const property of properties) {
    const node = entity.nodes[property];

    const propertyParts: string[] = [];
    propertyParts.push(`\t${property}`);

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
      default:
        throw new Error(`Unknown schema node property type: ${type}`);
    }
    propertyParts.push(";");
    typeParts.push(propertyParts.join(""));
  }

  typeParts.push("}");

  return typeParts.join("\n");
}

export function generateTypes({ schema }: GenerateTypesArguments): string {
  const types: string[] = [];

  for (const schemaNode of schema.nodes) {
    types.push(schemaEntityToTypeDefinition(schemaNode));
  }

  return types.join("\n\n");
}
