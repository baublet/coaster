import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";

export default function renameDatabase(
  from: string,
  to: string
): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.DATABASE_RENAME,
    database: from,
    payload: {
      newName: to
    }
  };
}
