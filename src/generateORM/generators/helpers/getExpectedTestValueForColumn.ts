import { RawColumn } from "../../drivers";

export function getExpectedTestValueForColumn(column: RawColumn): string {
  switch (column.type) {
    case "Date":
      return "expect.any(Date)";
    case "boolean":
      return "expect.any(Boolean)";
    case "number":
      return "expect.any(Number)";
    case "string":
      return "expect.any(String)";
    case "enum":
      return "expect.any(String)";
  }
  return "expect.anything()";
}
