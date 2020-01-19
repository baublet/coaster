import knex from "knex";

import { PersistConnection } from "./connect";
import { ModelFactory, Model } from "model/createModel";

export type PersistQuery<T> = knex.QueryBuilder<T>;

export function queryFactory<T>(
  connection: PersistConnection,
  modelFactory: ModelFactory
): PersistQuery<T> {
  return connection<Model<T>>(modelFactory.tableName);
}
