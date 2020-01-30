import { ModelFactoryWithPersist, ModelDataDefaultType } from "model/types";

import { PersistTransaction, PersistFindManyFunction } from "./types";

export function findManyFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistFindManyFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function findMany(
    ids: string[],
    columns: string[] = ["*"],
    trx: PersistTransaction = null
  ) {
    const cnx = trx || connection;

    const results = await cnx<T>(tableName)
      .whereIn("id", ids)
      .select(...columns);

    return results.map(result => (result ? modelFactory(result as T) : null));
  };
}
