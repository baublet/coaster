import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function renameTable(
  database,
  from: string,
  to: string
): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.TABLE_RENAME,
    database,
    table: from,
    payload: {
      newName: to
    }
  };
}
