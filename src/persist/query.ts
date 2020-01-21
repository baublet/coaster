import knex from "knex";

import { PersistConnection } from "./connect";
import { Model, ModelFactoryWithPersist } from "model/createModel";

export type PersistQueryFunction = (
  knex: knex.QueryBuilder
) => knex.QueryBuilder;

export type PersistQuery<T, C> = (
  q: PersistQueryFunction
) => Promise<Model<T & C>[]>;

export function queryFactory<T, C>(
  connection: PersistConnection,
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistQuery<T, C> {
  return async function(q: PersistQueryFunction): Promise<Model<T & C>[]> {
    const results = await q(connection<T>(modelFactory.tableName));
    if (results) {
      return results.map(modelFactory);
    }
    return [];
  };
}
