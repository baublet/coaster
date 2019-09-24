import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function createIndex(
  databaseName: string,
  tableName: string,
  indexName: string,
  columns: string[]
): SchemaBuilderOperation {
  return {
    database: databaseName,
    table: tableName,
    type: SchemaBuilderOperationType.INDEX_CREATE,
    payload: {
      indexName,
      columns
    }
  };
}
