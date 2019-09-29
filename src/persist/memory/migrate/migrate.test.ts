/* eslint require-atomic-updates: off */

import buildSchema, { Schema } from "persist/schema";
import memoryAdapter from "persist/memory";
import migrate from "./migrate";
import { PersistAdapter } from "persist";

let db: PersistAdapter;
let schema: Schema;

beforeEach(() => {
  db = memoryAdapter({});
  schema = buildSchema();
  schema.createDatabase("test").createTable("hats");
});

it("creates the database", () => {
  migrate(db, schema.operations);
  expect(db.meta.memoryMap.test).toBeTruthy();
});

it("renames the database", async () => {
  schema.renameDatabase("test", "test-2");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]).toBeFalsy();
  expect(db.meta.memoryMap["test-2"]).toBeTruthy();
});

it("removes the database", async () => {
  schema.removeDatabase("test");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]).toBeFalsy();
});

it("creates the table", async () => {
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"]).toBeTruthy();
});

it("renames the table", async () => {
  schema.database("test").renameTable("hats", "shoes");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["shoes"]).toBeTruthy();
  expect(db.meta.memoryMap["test"]["hats"]).toBeFalsy();
});

it("removes the table", async () => {
  schema.database("test").removeTable("hats");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"]).toBeFalsy();
});

it("removes the table", async () => {
  schema.database("test").removeTable("hats");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"]).toBeFalsy();
});

it("renames a column properly", async () => {
  schema
    .database("test")
    .table("hats")
    .createColumn("make");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"]).toBeTruthy();

  db.meta.memoryMap["test"]["hats"].one = {
    id: "one",
    make: "testing"
  };
  schema
    .database("test")
    .table("hats")
    .renameColumn("make", "model");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"].one).toEqual({
    id: "one",
    model: "testing"
  });
});

it("removes a column properly", async () => {
  schema
    .database("test")
    .table("hats")
    .createColumn("make");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"]).toBeTruthy();

  db.meta.memoryMap["test"]["hats"].one = {
    id: "one",
    make: "testing"
  };
  schema
    .database("test")
    .table("hats")
    .removeColumn("make");
  await migrate(db, schema.operations);
  expect(db.meta.memoryMap["test"]["hats"].one).toEqual({
    id: "one"
  });
});
