import {
  PersistTransaction,
  PersistQueryFunctionOnFactory,
  PersistQueryFunction
} from "./types";
import { Model, ModelFactoryWithPersist } from "model/types";

export function queryFactory<T, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistQueryFunctionOnFactory<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    q: PersistQueryFunction,
    trx: PersistTransaction = null
  ): Promise<Model<T & C>[]> {
    const cnx = trx || connection;
    const results = await q(cnx<T>(tableName));
    if (results) {
      return results.map(modelFactory);
    }
    return [];
  };
}
