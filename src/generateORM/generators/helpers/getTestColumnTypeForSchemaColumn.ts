import { RawColumn } from "../../drivers";

export type TestColumnType =
  | "integer"
  | "text"
  | "boolean"
  | "datetime"
  | "jsonb";

export function getTestColumnTypeForSchemaColumn(
  column: Pick<RawColumn, "type">
): TestColumnType {
  switch (column.type) {
    case "number":
      return "integer";
    case "boolean":
      return "boolean";
    case "Date":
      return "datetime";
    case "AnyJson":
      return "jsonb";
  }

  return "text";
}
