import knex from "knex";
import { Connection } from "persist/connection";

export async function createTestConnection(): Promise<Connection> {
  return knex({
    client: "sqlite3",
    connection: {
      filename: "./test.sqlite",
    },
  });
}
