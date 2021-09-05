import { RawColumn } from "../../drivers";

export type TestColumnType =
  | "integer"
  | "text"
  | "boolean"
  | "dateTime"
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
      return "dateTime";
    case "AnyJson":
      return "jsonb";
  }

  return "text";
}
