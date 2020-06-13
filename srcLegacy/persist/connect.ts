import knex from "knex";
import { PersistConnectArguments, PersistConnection } from "./types";

export function connect(config: PersistConnectArguments): PersistConnection {
  return knex(config);
}
