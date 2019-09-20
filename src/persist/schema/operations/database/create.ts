import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema/shema";

export default function createDatabase(name: string): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.DATABASE_CREATE,
    database: name
  };
}
