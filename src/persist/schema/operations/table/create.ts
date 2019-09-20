import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema/shema";

export default function createTable(
  database,
  name: string
): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.TABLE_CREATE,
    database,
    table: name
  };
}
