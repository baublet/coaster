import { PersistAdapter } from "persist";
import { Database } from "better-sqlite3";

interface SqliteAdapterMeta {
  file: string;
  db: Database;
}

export interface SqlStatement {
  query: string;
  values: any[];
}

export type SqliteAdapter = PersistAdapter<SqliteAdapterMeta>;
