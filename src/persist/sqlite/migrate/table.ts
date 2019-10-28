import { SqliteAdapter } from "..";
import { SchemaColumnOptions } from "persist/schema";
import createTableStatement from "../../sql/statements/table/create";
import renameTableStatement from "../../sql/statements/table/rename";
import removeTableStatement from "../../sql/statements/table/remove";
import migrationError from "../errors/migration";

export function createTable(
  adapter: SqliteAdapter,
  tableName: string,
  columns: Record<string, SchemaColumnOptions>
): boolean {
  try {
    const db = adapter.meta.db;
    db.prepare(createTableStatement(tableName, true, columns)).run();
    return true;
  } catch (e) {
    throw migrationError(e);
  }
}

export function renameTable(
  adapter: SqliteAdapter,
  from: string,
  to: string
): boolean {
  try {
    const db = adapter.meta.db;
    db.prepare(renameTableStatement(from, to)).run();
    return true;
  } catch (e) {
    throw migrationError(
      e,
      "You may have tried to rename a table before you created a column. SQLite does not allow you to create tables without initial columns, so we don't actually create the table until you specify one or more columns."
    );
  }
}

export function removeTable(
  adapter: SqliteAdapter,
  tableName: string
): boolean {
  try {
    const db = adapter.meta.db;
    db.prepare(removeTableStatement(tableName)).run();
    return true;
  } catch (e) {
    throw migrationError(
      e,
      "You may have tried to remove a table before you created a column. SQLite does not allow you to create tables without initial columns, so we don't actually create the table until you specify one or more columns."
    );
  }
}
