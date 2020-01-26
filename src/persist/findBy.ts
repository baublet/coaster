import { ModelFactoryWithPersist, ModelDataDefaultType } from "model/types";

import { PersistTransaction, PersistFindByFunction } from "./types";

export function findByFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistFindByFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function findBy(
    by: Record<string, string | number | boolean>,
    columns: string[] = ["*"],
    trx: PersistTransaction = null
  ) {
    const cnx = trx || connection;

    const results = await cnx<T>(tableName)
      .where(by)
      .select(...columns)
      .limit(1);

    if (results[0]) {
      return modelFactory(results[0] as T);
    }
    return null;
  };
}
