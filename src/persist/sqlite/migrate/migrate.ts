import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType
} from "persist/schema";
// import createColumn from "./createColumn";
import createDatabase from "./createDatabase";
// import createTable from "./createTable";
// import removeColumn from "./removeColumn";
// import removeDatabase from "./removeDatabase";
// import removeTable from "./removeTable";
// import renameColumn from "./renameColumn";
// import renameDatabase from "./renameDatabase";
// import renameTable from "./renameTable";
import operationNotSupported from "persist/schema/errors/operationNotSupported";
import { SqliteAdapter } from "persist/sqlite";

export default async function migrate(
  adapter: SqliteAdapter,
  operations: SchemaBuilderOperation[]
) {
  // TODO: calculate this from in-DB schema versioning
  const slicePoint = 0;

  const ops = operations.slice(slicePoint).map(operation => {
    switch (operation.type) {
      // Database
      case SchemaBuilderOperationType.DATABASE_CREATE:
        return createDatabase(adapter, operation.database);
      case SchemaBuilderOperationType.DATABASE_RENAME:
      // return renameDatabase(
      //   adapter,
      //   operation.database,
      //   operation.payload.newName
      // );
      case SchemaBuilderOperationType.DATABASE_REMOVE:
      // return removeDatabase(adapter, operation.database);

      // Table
      case SchemaBuilderOperationType.TABLE_CREATE:
      // return createTable(adapter, operation.database, operation.table);
      case SchemaBuilderOperationType.TABLE_RENAME:
      // return renameTable(
      //   adapter,
      //   operation.database,
      //   operation.table,
      //   operation.payload.newName
      // );
      case SchemaBuilderOperationType.TABLE_REMOVE:
      // return removeTable(adapter, operation.database, operation.table);

      // Column
      case SchemaBuilderOperationType.COLUMN_CREATE:
      // return createColumn(adapter, operation.database, operation.table);
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
