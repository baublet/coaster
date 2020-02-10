import {
  PersistTransaction,
  PersistQueryFunctionOnFactory,
  PersistQueryFunction
} from "./types";
import { ModelFactoryWithPersist, ModelDataPropTypes } from "model/types";

export function queryFactory<T extends ModelDataPropTypes>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistQueryFunctionOnFactory<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    q: PersistQueryFunction,
    trx: PersistTransaction = null
  ): Promise<ReturnType<ModelFactoryWithPersist<T>>[]> {
    const cnx = trx || connection;
    const results = await q(cnx<T>(tableName));
    if (results) {
      return results.map(modelFactory);
    }
    return [];
  };
}
