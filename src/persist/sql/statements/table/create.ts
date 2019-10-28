import { SchemaColumnOptions } from "persist/schema";

function columnDefinitionsToTableReadyString(
  columns: Record<string, SchemaColumnOptions>,
  primaryKeyColumn: string
): string {
  const columnStrings = Object.keys(columns)
    .map((columnName: string) => {
      const options = columns[columnName];
      let str = `${columnName} ${options.type}`;
      if (options.default !== undefined) {
        str += ` DEFAULT ${options.default}`;
      }
      if (options.autoIncrement) {
        str += ` AUTOINCREMENT`;
      }
      if (options.nullable !== true) {
        str += ` NOT NULL`;
      }
      if (columnName === primaryKeyColumn) {
        str += ` PRIMARY KEY`;
      }
      return str;
    })
    .join(",");
  if (columnStrings) {
    return `(${columnStrings})`;
  }
  return "";
}

export default function createTableSQLStatement(
  tableName: string,
  ifNotExists: boolean = true,
  // Some DB engines like SQLite don't let you create tables without some
  // initial columns defined. This gives you the ability to pass them in.
  initialColumns: Record<string, SchemaColumnOptions> = {},
  primaryKeyColumn: string = ""
): string {
  const ifNotExistsString = ifNotExists ? " IF NOT EXISTS " : " ";
  return `CREATE TABLE${ifNotExistsString}${tableName}${columnDefinitionsToTableReadyString(
    initialColumns,
    primaryKeyColumn
  )}`;
}
