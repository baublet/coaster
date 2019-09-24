import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function removeIndex(
  databaseName: string,
  tableName: string,
  indexName: string
): SchemaBuilderOperation {
  return {
    database: databaseName,
    table: tableName,
    type: SchemaBuilderOperationType.INDEX_CREATE,
    payload: {
      indexName
    }
  };
}
