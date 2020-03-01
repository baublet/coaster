import {
  PersistTransaction,
  PersistCountFunction,
  PersistedModelFactory
} from "./types";

export function countFactory<T extends PersistedModelFactory>(
  modelFactory: T
): PersistCountFunction {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;

  return async function(trx: PersistTransaction = null): Promise<number> {
    const cnx = trx || connection;
    const count = await cnx(tableName).count();
    return count[0]["count(*)"] as number;
  };
}
