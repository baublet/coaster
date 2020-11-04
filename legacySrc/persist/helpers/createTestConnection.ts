import knex from "knex";
import { v4 } from "uuid";

import { Connection } from "persist/connection";

export async function createTestConnection(): Promise<Connection> {
  return knex({
    client: "sqlite3",
    connection: {
      filename: `./testDatabases/${v4()}.sqlite`,
    },
    useNullAsDefault: true,
  });
}
