import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";
import operationNotSupported from "persist/schema/errors/operationNotSupported";
import { SqliteAdapter } from "persist/sqlite";
import { createTable, removeTable, renameTable } from "./table";
import { createColumn } from "./column";

function isTableCreated(
  tablesToCreate: SchemaBuilderOperation[],
  table: string
): boolean {
  for (let i = 0; i < tablesToCreate.length; i++) {
    if (tablesToCreate[i].table === table) {
      return false;
    }
  }
  return true;
}

function removeTableFromToCreateList(
  tablesToCreate: SchemaBuilderOperation[],
  table: string
): void {
  let i: number = 0;
  for (; i < tablesToCreate.length; i++) {
    if (tablesToCreate[i].table === table) {
      break;
    }
  }
  tablesToCreate.splice(i, 1);
}

export default async function migrate(
  adapter: SqliteAdapter,
  operations: SchemaBuilderOperation[]
) {
  // TODO: calculate this from in-DB schema versioning
  const slicePoint = 0;

  const tablesToCreate = [];

  const ops = operations.slice(slicePoint).map(operation => {
    switch (operation.type) {
      // Database
      // NOTE: SQLite DB-level operations are all at the filesystem
      // level and not managed from the database driver itself.
      case SchemaBuilderOperationType.DATABASE_CREATE:
        return true;
      case SchemaBuilderOperationType.DATABASE_RENAME:
        return true;
      case SchemaBuilderOperationType.DATABASE_REMOVE:
        return true;

      // Table
      case SchemaBuilderOperationType.TABLE_CREATE:
        // SQLite doesn't let you create tables without initial columns,
        // so we need to wait until the first column is created before we
        // can do this.
        tablesToCreate.push(operation);
        return true;
      case SchemaBuilderOperationType.TABLE_RENAME:
        return renameTable(adapter, operation.table, operation.payload.newName);
      case SchemaBuilderOperationType.TABLE_REMOVE:
        return removeTable(adapter, operation.table);

      // Column
      case SchemaBuilderOperationType.COLUMN_CREATE:
        // If the table isn't created yet, ball up this column's creation
        // with the table's creation.
        if (!isTableCreated(tablesToCreate, operation.table)) {
          createTable(adapter, operation.table, {
            [operation.column]: {
              autoIncrement: Boolean(operation.payload.autoIncrement),
              default: operation.payload.default,
              nullable: Boolean(operation.payload.nullable),
              name: operation.column,
              type: operation.payload.type
            }
          });
          removeTableFromToCreateList(tablesToCreate, operation.table);
          return true;
        }
        return createColumn(adapter, operation.database, operation.table);
      case SchemaBuilderOperationType.COLUMN_RENAME:
      // return renameColumn(
      //   adapter,
      //   operation.database,
      //   operation.table,
      //   operation.column,
      //   operation.payload.newName
      // );
      case SchemaBuilderOperationType.COLUMN_REMOVE:
      // return removeColumn(
      //   adapter,
      //   operation.database,
      //   operation.table,
      //   operation.column
      // );
      case SchemaBuilderOperationType.COLUMN_SET_AUTO_INCREMENT:
      case SchemaBuilderOperationType.COLUMN_SET_DEFAULT:
      case SchemaBuilderOperationType.COLUMN_SET_NULLABLE:
      case SchemaBuilderOperationType.COLUMN_SET_TYPE:
      // return;

      // Indexes
      case SchemaBuilderOperationType.INDEX_CREATE:
      case SchemaBuilderOperationType.INDEX_REMOVE:
      // return;

      default:
        throw operationNotSupported(adapter, operation);
    }
  });
  return Promise.all(ops);
}
