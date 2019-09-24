import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function renameColumn(
  databaseName: string,
  tableName: string,
  from: string,
  to: string
): SchemaBuilderOperation {
  return {
    database: databaseName,
    table: tableName,
    column: from,
    type: SchemaBuilderOperationType.COLUMN_RENAME,
    payload: {
      to
    }
  };
}
