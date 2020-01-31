import { ModelFactoryWithPersist, ModelDataDefaultType } from "model/types";

import { PersistTransaction, PersistFindFunction } from "./types";
import { cannotFindByBlankId } from "./error/cannotFindBlankId";

export function findFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
) {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function find(
    id: string | string[],
    columns: string[] = ["*"],
    trx: PersistTransaction = null
  ) {
    const cnx = trx || connection;

    if (Array.isArray(id)) {
      const results = await cnx<T>(tableName)
        .whereIn("id", id)
        .select(...columns);

      return results.map(result => (result ? modelFactory(result as T) : null));
    }

    if (!id) {
      throw cannotFindByBlankId();
    }

    const results = await cnx<T>(tableName)
      .where("id", "=", id)
      .select(...columns)
      .limit(1);

    if (results[0]) {
      return modelFactory(results[0] as T);
    }
    return null;
  } as PersistFindFunction<T, C>;
}
