import { Schema } from "persist/schema";
import db from "better-sqlite3";
import { SqliteAdapter } from ".";

interface SqliteOptions {
  file?: string;
  defaultDatabase?: string;
  memory: boolean;
}

export default function persistInSqlite(
  schema: Schema,
  { file, memory = false }: SqliteOptions
): SqliteAdapter {
  const fileName = file || "default.db";
  return {
    meta: {
      file: fileName,
      db: db(fileName, {
        memory,
        verbose: console.log
      })
    },
    name: "memory",
    schema,
    defaultDatabase: fileName,
    deleteBy: () => null,
    findBy: () => Promise.resolve([]),
    save: () => null
  };
}
