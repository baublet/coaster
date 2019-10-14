import { SqliteAdapter } from "..";

export default async function createDatabase(
  _sqlite: SqliteAdapter,
  _database: string
) {
  // Sqlite's a little weird here in that so long as the connection is
  // open, the database exists
  return true;
}
