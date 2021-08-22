import { RawColumn } from "../../drivers";
import { MetaData } from "../";

export function getDefaultJavascriptForColumnType(
  column: RawColumn,
  metaData: MetaData
): string {
  switch (column.type) {
    case "string":
      return `"${column.name}"`;
    case "number":
      return "1";
    case "boolean":
      return "true";
    case "unknown":
      return "1";
    case "Date":
      return "new Date()";
    case "AnyJson":
      return "{}";
    case "enum": {
      const values = metaData.rawEnumValues.get(column.enumPath);
      return `"${values[0]}"`;
    }
  }
  throw new Error("Invariance violation! Unknown column type: " + column.type);
}
