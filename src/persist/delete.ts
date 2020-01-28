import {
  Model,
  ModelFactoryWithPersist,
  ModelDataDefaultType,
  ModelInternalProperties,
  isModel
} from "model/types";

import { PersistDeleteFunction, PersistTransaction } from "./types";

export function deleteFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistDeleteFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    model: Model<T & C> | string,
    trx: PersistTransaction = null
  ): Promise<boolean> {
    const id = typeof model === "string" ? model : model.id;
    const cnx = trx || connection;

    // Throw here with a more helpful error message -- we get here when a user passes in an unsaved model
    if (!id) throw new Error("Cannot delete an undefined ID!");

    const result = await cnx(tableName)
      .where("id", id)
      .delete()
      .limit(1);

    if (result) {
      if (isModel(model)) {
        ((model as any) as ModelInternalProperties).$setDeleted(true);
      }
      return true;
    }
    return false;
  };
}
