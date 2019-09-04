import { Schema, SchemaNode } from "..";
import multiplePrimaryKeysError from "../error/multiplePrimaryKeys";

export default function multiplePrimaryKeys({
  $tableName,
  ...schema
}: Schema): true | string {
  const keys = Object.keys(schema);
  const primaryKeys: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const node: string | SchemaNode = schema[key];
    if (typeof node === "string") {
      continue;
    }
    if (node.persistOptions.primaryKey) {
      primaryKeys.push(key);
    }
  }

  if (primaryKeys.length > 1) {
    return multiplePrimaryKeysError($tableName, primaryKeys.join(", "));
  }

  return true;
}
