import knex from "knex";
import { v4 } from "uuid";

import { Connection } from "persist/connection";

export let openConnection: Connection | undefined;

export async function createTestConnection(): Promise<Connection> {
  if (!openConnection) {
    openConnection = await knex({
      client: "sqlite3",
      connection: {
        filename: `./testDatabases/${v4()}.sqlite`,
      },
      useNullAsDefault: true,
    });
  }
  return openConnection;
}
