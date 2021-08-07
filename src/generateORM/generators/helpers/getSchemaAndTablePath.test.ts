import { getSchemaAndTablePath } from "./getSchemaAndTablePath";

it("returns schema.table", () => {
  expect(getSchemaAndTablePath("schema", "table")).toEqual("schema.table");
});

it("returns table if no schema is provided", () => {
  expect(getSchemaAndTablePath(undefined, "table")).toEqual("table");
});
