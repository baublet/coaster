import buildSchema, { Schema } from "persist/schema";
import tableNotFound from "./errors/tableNotFound";
import tableExists from "./errors/tableExists";
import createTable from "./operations/table/create";
import renameTable from "./operations/table/rename";
import removeTable from "./operations/table/remove";

let schema: Schema;

beforeEach(() => {
  schema = buildSchema();
  schema.createDatabase("test");
});

it("creates a table properly", () => {
  schema.database("test").createTable("hats");
  expect(schema.database("test").table("hats").name).toBe("hats");
  expect(schema.operations.length).toBe(5);
  expect(schema.operations[1]).toEqual(createTable("test", "hats"));
});

it("renames a table properly", () => {
  schema.database("test").createTable("hats");
  const hats = schema.database("test").table("hats");
  schema.database("test").renameTable("hats", "shoes");
  expect(schema.database("test").table("shoes")).toBe(hats);
  expect(schema.operations.length).toBe(6);
  expect(schema.operations[5]).toEqual(renameTable("test", "hats", "shoes"));
});

it("removes a table properly", () => {
  schema.database("test").createTable("hats");
  schema.database("test").removeTable("hats");
  expect(Object.keys(schema.database("test").tables).length).toBe(0);
  expect(schema.operations.length).toBe(6);
  expect(schema.operations[5]).toEqual(removeTable("test", "hats"));
});

it("throws properly when accessing things or performing operations it shouldn't", () => {
  schema.database("test").createTable("hats");
  schema.database("test").createTable("shoes");

  expect(() => schema.database("test").createTable("shoes")).toThrowError(
    tableExists("test", "shoes")
  );

  expect(() =>
    schema.database("test").renameTable("hats", "shoes")
  ).toThrowError(tableExists("test", "shoes"));

  schema.database("test").removeTable("hats");
  expect(() => schema.database("test").table("hats")).toThrowError(
    tableNotFound("test", "hats")
  );

  expect(() => schema.database("test").removeTable("hats")).toThrowError(
    tableNotFound("test", "hats")
  );
});
