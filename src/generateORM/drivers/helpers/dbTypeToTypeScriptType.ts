import { RawColumn } from "../index";

const booleans = ["bool"];
const jsons = ["json"];
const dates = ["time", "date"];
const strings = ["text", "char", "uuid", "interval"];
const numbers = [
  "int",
  "float",
  "double",
  "decimal",
  "unsigned",
  "serial",
  "numeric",
  "real",
  "money",
];
const enums = ["USER-DEFINED"];

function matches(needles: string[], haystack: string): boolean {
  for (const needle of needles) {
    if (haystack.includes(needle)) {
      return true;
    }
  }
  return false;
}

export function dbTypeToTypeScriptType(dbType: string): RawColumn["type"] {
  if (matches(jsons, dbType)) {
    return "JSON";
  }

  if (matches(booleans, dbType)) {
    return "boolean";
  }

  if (matches(dates, dbType)) {
    return "Date";
  }

  if (matches(strings, dbType)) {
    return "string";
  }

  if (matches(numbers, dbType)) {
    return "number";
  }

  if (matches(enums, dbType)) {
    return "enum";
  }

  return "unknown";
}
