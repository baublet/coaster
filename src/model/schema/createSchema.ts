import {
  Schema,
  schemaNodeDbOptionsDefaults,
  SchemaNodeType,
  SchemaNode,
  UncompiledSchema,
  isSchemaNodeType,
  isSchemaNodeOptions
} from "./index";

import validate from "./validate";
import generateNames from "../../helpers/generateNames";
import idNameFromName from "./idNameFromName";
import { isModelFactory } from "../createModel";

export default function createSchema(schema: UncompiledSchema): Schema {
  const compiledSchema: Schema = {};

  // Expand simple definitions out properly
  Object.keys(schema).forEach((key: string) => {
    const node = schema[key];
    if (isSchemaNodeOptions(node)) {
      const schemaNode = {
        dbOptions: schemaNodeDbOptionsDefaults,
        names: generateNames(key),
        relation: false,
        uniqueName: key,
        ...(node as SchemaNode)
      };
      compiledSchema[key] = schemaNode;
      return;
    }
    if (isSchemaNodeType(node) || isModelFactory(node)) {
      compiledSchema[key] = {
        type: isModelFactory(node) ? SchemaNodeType.MODEL : node,
        uniqueName: key,
        names: generateNames(key),
        relation: false,
        dbOptions: schemaNodeDbOptionsDefaults
      };
    }
  });

  // Properly expand model relations
  Object.values(compiledSchema).forEach((node: SchemaNode) => {
    if (
      node.type === SchemaNodeType.MODEL ||
      node.type === SchemaNodeType.MODELS
    ) {
      if (!node.dbOptions.foreignKey) {
        node.dbOptions.foreignKey = "id";
      }
      node.relation = true;
      let newName: string;
      switch (node.type) {
        case SchemaNodeType.MODEL:
          node.type = SchemaNodeType.ID;
          newName = idNameFromName(node.names.canonical);
          break;
        case SchemaNodeType.MODELS:
          node.type = SchemaNodeType.ARRAY_OF_IDS;
          newName = idNameFromName(node.names.canonical, true);
          break;
      }
      node.names = generateNames(newName);
    }
  });

  const valid = validate(compiledSchema as Schema);
  if (valid) {
    return compiledSchema as Schema;
  }
  throw `Your schema is invalid

${valid}`;
}
