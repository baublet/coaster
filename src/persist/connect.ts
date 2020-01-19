import knex from "knex";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;

export function connect(config: PersistConnectArguments): PersistConnection {
  return knex(config);
}
