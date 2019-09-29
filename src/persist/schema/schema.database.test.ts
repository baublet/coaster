import createSchema from "persist/schema";
import createDatabase from "./operations/database/create";
import removeDatabase from "./operations/database/remove";
import renameDatabase from "./operations/database/rename";
import databaseNotFound from "./errors/databaseNotFound";
import createIndex from "./operations/index/create";
import removeIndex from "./operations/index/remove";

it("creates a database", () => {
  const schema = createSchema();
  schema.createDatabase("test-database");
  expect(Object.keys(schema.databases)).toEqual(["test-database"]);
  expect(schema.operations.length).toBe(1);
  expect(schema.operations[0]).toEqual(createDatabase("test-database"));
});

it("removes a database", () => {
  const schema = createSchema();
  schema.createDatabase("test-database");
  expect(Object.keys(schema.databases)).toEqual(["test-database"]);
  schema.removeDatabase("test-database");
  expect(Object.keys(schema.databases)).toEqual([]);
  expect(schema.operations.length).toBe(2);
  expect(schema.operations[1]).toEqual(removeDatabase("test-database"));
});

it("renames a database", () => {
  const schema = createSchema();
  schema.createDatabase("test-database");
  expect(Object.keys(schema.databases)).toEqual(["test-database"]);
  schema.renameDatabase("test-database", "renamed-database");
  expect(Object.keys(schema.databases)).toEqual(["renamed-database"]);
  expect(schema.operations.length).toBe(2);
  expect(schema.operations[1]).toEqual(
    renameDatabase("test-database", "renamed-database")
  );
});

it("throw properly when trying to access or perform operations on an unknown database", () => {
  const schema = createSchema();
  schema.createDatabase("test-database");
  expect(() => schema.removeDatabase("not")).toThrowError(
    databaseNotFound("not")
  );
  expect(() => schema.renameDatabase("not", "here")).toThrowError(
    databaseNotFound("not")
  );
  expect(() => schema.database("not")).toThrowError(databaseNotFound("not"));
});

it("creates and removes an index properly", () => {
  const schema = createSchema();
  schema.createDatabase("test-database");
  const db = schema.database("test-database");
  db.createTable("hats");
  db.createIndex("hats", "idx_id", ["id"]);
  db.removeIndex("hats", "idx_id");

  expect(schema.operations.length).toBe(7);

  expect(schema.operations[5]).toEqual(
    createIndex("test-database", "hats", "idx_id", ["id"])
  );
  expect(schema.operations[6]).toEqual(
    removeIndex("test-database", "hats", "idx_id")
  );
});
