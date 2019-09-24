import buildSchema, { Schema, SchemaTable, SchemaColumnType } from ".";
import createColumn from "./operations/column/create";
import renameColumn from "./operations/column/rename";
import removeColumn from "./operations/column/remove";

let schema: Schema;
let table: SchemaTable;

beforeEach(() => {
  schema = buildSchema();
  schema.createDatabase("test");
  schema.database("test").createTable("hats");
  table = schema.database("test").table("hats");
});

it("creates a column properly with default options", () => {
  table.createColumn("make");
  expect(Object.keys(table.columns).length).toBe(4);
  expect(Object.keys(table.columns)[3]).toBe("make");
  expect(table.columns.make.options).toEqual({
    autoIncrement: false,
    default: null,
    name: "make",
    nullable: false,
    type: SchemaColumnType.TEXT
  });
});

it("creates a column properly with default options", () => {
  table.createColumn("make", {
    autoIncrement: true,
    default: 12,
    nullable: true,
    type: SchemaColumnType.NUMBER
  });
  expect(Object.keys(table.columns).length).toBe(4);
  expect(Object.keys(table.columns)[3]).toBe("make");
  expect(table.columns.make.options).toEqual({
    autoIncrement: true,
    default: 12,
    name: "make",
    nullable: true,
    type: SchemaColumnType.NUMBER
  });
  expect(schema.operations.length).toBe(6);
  expect(schema.operations[5]).toEqual(
    createColumn("test", "hats", "make", {
      autoIncrement: true,
      default: 12,
      name: "make",
      nullable: true,
      type: SchemaColumnType.NUMBER
    })
  );
});

it("creates a column properly with default options", () => {
  table.createColumn("make");
  table.renameColumn("make", "model");
  expect(schema.operations.length).toBe(7);
  expect(schema.operations[6]).toEqual(
    renameColumn("test", "hats", "make", "model")
  );
});

it("removes a column properly", () => {
  table.createColumn("make");
  table.removeColumn("make");
  expect(schema.operations.length).toBe(7);
  expect(schema.operations[6]).toEqual(removeColumn("test", "hats", "make"));
});
