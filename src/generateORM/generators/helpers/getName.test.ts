import { getName } from "./getName";

describe("columns", () => {
  it("returns the name if the get name fn is called", () => {
    expect(
      getName("column", "table", "schema", true, () => "itWorks!")
    ).toEqual("itWorks!");
  });

  it("returns the DEFAULT name if the get name fn is called, but returns undefined", () => {
    expect(getName("column", "table", "schema", true, () => undefined)).toEqual(
      "column"
    );
  });

  it("returns the column name", () => {
    expect(getName("column", "table", "schema")).toEqual("column");
  });
});

describe("tables", () => {
  it("returns the table name", () => {
    expect(getName(undefined, "table", "schema")).toEqual("Table");
  });
  it("returns the table name with a prefixed schema name", () => {
    expect(getName(undefined, "table", "schema", true)).toEqual("SchemaTable");
  });
});

describe("schema", () => {
  it("returns the schema name", () => {
    expect(getName(undefined, undefined, "schema")).toEqual("Schema");
  });
});
