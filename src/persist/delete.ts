import {
  Model,
  ModelFactoryWithPersist,
  ModelDataDefaultType,
  ModelInternalProperties
} from "model/types";

import { PersistDeleteFunction, PersistTransaction } from "./types";

export function deleteFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistDeleteFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function save(
    model: Model<T & C> | string,
    trx: PersistTransaction = null
  ): Promise<boolean> {
    const id = typeof model === "string" ? model : model.id;
    const cnx = trx || connection;

    const result = await cnx(tableName)
      .where("id", "=", id)
      .delete();

    if (result) {
      if (model) {
        ((model as any) as ModelInternalProperties).$setDeleted(true);
      }
      return true;
    }
    return false;
  };
}
