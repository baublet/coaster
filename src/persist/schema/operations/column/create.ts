import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType,
  SchemaColumnOptions
} from "persist/schema";

export default function createColumn(
  databaseName: string,
  tableName: string,
  name: string,
  columnOptions: SchemaColumnOptions
): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.COLUMN_CREATE,
    database: databaseName,
    table: tableName,
    column: name,
    payload: columnOptions
  };
}
