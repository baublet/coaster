import { getDefaultJavascriptForColumnType } from "./getDefaultJavascriptForColumnType";
import { getMockMetaData } from "../../mockMetaData";

const column: any = {
  name: "columnName",
  enumPath: "test.enum.path",
};

const mockMetaData = getMockMetaData();
mockMetaData.rawEnumValues.set("test.enum.path", ["enumValue"]);

it.each([
  ["string", '"columnName"'],
  ["number", "1"],
  ["boolean", "true"],
  ["unknown", "1"],
  ["Date", "new Date()"],
  ["AnyJson", "{}"],
  ["enum", '"enumValue"'],
])("generates the right type for a %s", (type, expectedResult) => {
  column.type = type;
  expect(getDefaultJavascriptForColumnType(column, mockMetaData)).toEqual(
    expectedResult
  );
});

it("throws on an unexpected type", () => {
  column.type = "uh oh, not a real type";
  expect(() =>
    getDefaultJavascriptForColumnType(column, mockMetaData)
  ).toThrowErrorMatchingInlineSnapshot(
    `"Invariance violation! Unknown column type: uh oh, not a real type"`
  );
});
