import { PersistAdapter } from "persist";
import { Schema } from "persist/schema";

interface SqliteOptions {
  defaultDatabase: string;
  memory: boolean;
}

export default function persistInSqlite(
  schema: Schema,
  { defaultDatabase = "default", memory = false }: SqliteOptions
): PersistAdapter {
  return {
    meta: {
      version: 0
    },
    name: "memory",
    schema,
    defaultDatabase,
    deleteBy: () => null,
    findBy: () => Promise.resolve([]),
    save: () => null
  };
}
