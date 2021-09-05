import {
  getTestColumnTypeForSchemaColumn,
  TestColumnType,
} from "./getTestColumnTypeForSchemaColumn";
import { RawColumn } from "../../drivers";

const testCases: [RawColumn["type"], TestColumnType][] = [
  ["AnyJson", "jsonb"],
  ["Date", "datetime"],
  ["boolean", "boolean"],
  ["enum", "text"],
  ["number", "integer"],
  ["string", "text"],
  ["unknown", "text"],
];

it.each(testCases)("when %s returns %s", (type, expected) => {
  expect(getTestColumnTypeForSchemaColumn({ type })).toEqual(expected);
});
