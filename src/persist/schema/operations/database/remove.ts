import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function removeDatabase(name: string): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.DATABASE_REMOVE,
    database: name
  };
}
