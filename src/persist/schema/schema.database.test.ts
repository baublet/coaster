import createSchema from "persist/schema";
import createDatabase from "./operations/database/create";
import removeDatabase from "./operations/database/remove";
import renameDatabase from "./operations/database/rename";
import databaseNotFound from "./errors/databaseNotFound";

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
  expect(() => schema.removeDatabase("not")).toThrow(databaseNotFound("not"));
  expect(() => schema.renameDatabase("not", "here")).toThrow(
    databaseNotFound("not")
  );
  expect(() => schema.database("not")).toThrow(databaseNotFound("not"));
});
