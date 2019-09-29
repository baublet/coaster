import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";
import createColumn from "./createColumn";
import createDatabase from "./createDatabase";
import createTable from "./createTable";
import removeColumn from "./removeColumn";
import removeDatabase from "./removeDatabase";
import removeTable from "./removeTable";
import renameColumn from "./renameColumn";
import renameDatabase from "./renameDatabase";
import renameTable from "./renameTable";
import operationNotSupported from "persist/schema/errors/operationNotSupported";
import { PersistAdapter } from "persist";

export default async function migrate(
  memoryAdapter: PersistAdapter,
  operations: SchemaBuilderOperation[]
) {
  const memoryMap = memoryAdapter.meta.memoryMap;
  operations.slice(memoryAdapter.meta.version).forEach(operation => {
    memoryAdapter.meta.version++;
    switch (operation.type) {
      // Database
      case SchemaBuilderOperationType.DATABASE_CREATE:
        return createDatabase(memoryMap, operation.database);
      case SchemaBuilderOperationType.DATABASE_RENAME:
        return renameDatabase(
          memoryMap,
          operation.database,
          operation.payload.newName
        );
      case SchemaBuilderOperationType.DATABASE_REMOVE:
        return removeDatabase(memoryMap, operation.database);

      // Table
      case SchemaBuilderOperationType.TABLE_CREATE:
        return createTable(memoryMap, operation.database, operation.table);
      case SchemaBuilderOperationType.TABLE_RENAME:
        return renameTable(
          memoryMap,
          operation.database,
          operation.table,
          operation.payload.newName
        );
      case SchemaBuilderOperationType.TABLE_REMOVE:
        return removeTable(memoryMap, operation.database, operation.table);

      // Column
      case SchemaBuilderOperationType.COLUMN_CREATE:
        return createColumn(memoryMap, operation.database, operation.table);
      case SchemaBuilderOperationType.COLUMN_RENAME:
        return renameColumn(
          memoryMap,
          operation.database,
          operation.table,
          operation.column,
          operation.payload.newName
        );
      case SchemaBuilderOperationType.COLUMN_REMOVE:
        return removeColumn(
          memoryMap,
          operation.database,
          operation.table,
          operation.column
        );
      default:
        throw operationNotSupported(memoryAdapter, operation);
    }
  });
}
