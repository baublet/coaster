import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema/shema";

export default function removeDatabase(name: string): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.DATABASE_DROP,
    database: name
  };
}
