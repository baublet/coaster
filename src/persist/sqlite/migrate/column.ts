import { SqliteAdapter } from "..";
import { SchemaColumnOptions } from "persist/schema";
import createColumnStatement from "../../sql/statements/column/create";

export function createColumn(
  adapter: SqliteAdapter,
  tableName: string,
  columnName: string,
  options: SchemaColumnOptions
): boolean {
  const db = adapter.meta.db;
  db.prepare(createColumnStatement(tableName, columnName, options)).run();
  return true;
}
