import { SchemaColumnOptions } from "persist/schema";

export default function createColumnStatement(
  tableName: string,
  columnName: string,
  options: SchemaColumnOptions,
  primaryKey: boolean = false
): string {
  let str = `ALTER TABLE ${tableName} ADD ${columnName} ${options.type}`;

  if (options.default !== undefined) {
    str += ` DEFAULT ${options.default}`;
  }
  if (options.autoIncrement) {
    str += ` AUTOINCREMENT`;
  }
  if (options.nullable !== true) {
    str += ` NOT NULL`;
  }
  if (primaryKey) {
    str += ` PRIMARY KEY`;
  }

  return str;
}
