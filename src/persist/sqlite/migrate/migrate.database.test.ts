import sqliteAdapter from "../sqlite";
import buildSchema, { Schema } from "persist/schema";
import migrate from "persist/sqlite/migrate";
import { SqliteAdapter } from "..";
import mockSqliteAdapter from "../sqlite.mock";

let mockAdapter: SqliteAdapter = {
  meta: {
    db: mockSqliteAdapter()
  }
} as any;
let schema: Schema;

it("creates a database properly", async () => {
  schema = buildSchema();
  schema.createDatabase("test");
  await expect(migrate(mockAdapter, schema.operations)).resolves.toBeTruthy();
});
