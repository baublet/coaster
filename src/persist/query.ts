import {
  PersistTransaction,
  PersistQueryFunctionOnFactory,
  PersistQueryFunction,
  PersistModelArgs,
  PersistedModelFactory,
  PersistedModel
} from "./types";

export function queryFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistQueryFunctionOnFactory<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;

  return async function(
    q: PersistQueryFunction,
    trx: PersistTransaction = null
  ): Promise<PersistedModel<T>[]> {
    const cnx = trx || connection;
    const results = await q(cnx<T>(tableName));
    if (results) {
      return results.map(modelFactory);
    }
    return [];
  };
}
