import { RawColumn } from "../../drivers";

export function getTestColumnTypeForSchemaColumn(
  column: RawColumn
): "integer" | "text" | "boolean" | "datetime" | "jsonb" {
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
