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
import modelTypesRequireModelFactoriesError from "./error/modelTypesRequireModelFactoriesError";
import schemaInvalidError from "./error/schemaInvalidError";

export default function createSchema({
  $tableName,
  ...schema
}: UncompiledSchema): Schema {
  const compiledSchema: Schema = {
    $tableName
  };

  // Expand simple definitions out properly
  Object.keys(schema).forEach((key: string) => {
    const node = schema[key];
    if (isSchemaNodeOptions(node)) {
      const schemaNode = {
        dbOptions: schemaNodeDbOptionsDefaults(key),
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
        persistOptions: schemaNodeDbOptionsDefaults(key)
      };
      if (isModelFactory(node)) {
        compiledSchema[key]["model"] = node;
      }
    }
  });

  // Properly expand model relations
  Object.values(compiledSchema).forEach((node: SchemaNode | string) => {
    if (typeof node === "string") {
      return;
    }
    if (
      node.type === SchemaNodeType.MODEL ||
      node.type === SchemaNodeType.MODELS
    ) {
      if (!node.persistOptions.foreignKey) {
        node.persistOptions.foreignKey = "id";
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
      node.names = generateNames(newName, node.names.original);
      if (!node.model) {
        throw modelTypesRequireModelFactoriesError(node);
      }
    }
  });

  const valid = validate(compiledSchema as Schema);
  if (valid === true) {
    return compiledSchema as Schema;
  }

  throw schemaInvalidError(valid);
}
