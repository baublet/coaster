import { PersistAdapter } from "persist";
import { Schema } from "persist/schema";

export default function persistInSqlite(
  schema: Schema | null = null,
  defaultDatabase: string = ":memory:"
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
