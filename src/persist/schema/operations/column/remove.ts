import {
  SchemaBuilderOperationType,
  SchemaBuilderOperation
} from "persist/schema";

export default function removeColumn(
  databaseName: string,
  tableName: string,
  columnName: string
): SchemaBuilderOperation {
  return {
    database: databaseName,
    table: tableName,
    column: columnName,
    type: SchemaBuilderOperationType.COLUMN_REMOVE
  };
}
