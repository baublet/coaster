import {
  Schema,
  SchemaNodeType,
  ArraySchemaNode,
  SchemaNode,
  RootObjectSchemaNode
} from "./types";

export function nodeToName(
  node:
    | SchemaNode
    | SchemaNodeType.NUMBER
    | SchemaNodeType.STRING
    | SchemaNodeType.BOOLEAN
): string {
  if (node === SchemaNodeType.NUMBER) return "number";
  if (node === SchemaNodeType.STRING) return "string";
  if (node === SchemaNodeType.BOOLEAN) return "boolean";
  switch (node.type) {
    case SchemaNodeType.OBJECT:
      return node.name;
    case SchemaNodeType.ARRAY:
      return compileArray(node);
    case SchemaNodeType.NUMBER:
      return "number";
    case SchemaNodeType.STRING:
      return "string";
    case SchemaNodeType.BOOLEAN:
      return "boolean";
  }
}

export function compileArray(node: ArraySchemaNode): string {
  const of = Array.isArray(node.of) ? node.of : [node.of];
  return `(${of.map(nodeToName).join(" | ")})[]`;
}

export function compileObject(node: RootObjectSchemaNode): string {
  const doc = `/**\n * ${node.name}${
    node.description ? `\n * ${node.description}` : ``
  }\n */\n`;

  const indent = "  ";
  const { nodes } = node;
  const properties: string[] = [];
  for (const [property, node] of Object.entries(nodes)) {
    const declaration = nodeToName(node);
    const doc = node.description
      ? `${indent}/**\n${indent} * ${node.description}\n${indent} */\n`
      : ``;
    const maybe = node.maybe ? "?" : "";
    properties.push(`${doc}${indent}${property}${maybe}: ${declaration};`);
  }

  return `${doc}export interface ${node.name} {\n${properties.join("\n")}\n};`;
}

export function compile(schema: Schema): string {
  const definitions = schema.map(compileObject);
  return definitions.join("\n");
}
