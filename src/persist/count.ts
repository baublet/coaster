import { ModelFactoryWithPersist, ModelDataDefaultType } from "model/types";

import { PersistTransaction, PersistCountFunction } from "./types";

export function countFactory<T extends ModelDataDefaultType>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistCountFunction {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(trx: PersistTransaction = null): Promise<number> {
    const cnx = trx || connection;
    const count = await cnx(tableName).count();
    return count[0]["count(*)"] as number;
  };
}
