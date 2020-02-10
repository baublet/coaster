import {
  ModelFactoryWithPersist,
  ModelDataDefaultType,
  ModelInternalProperties,
  isModel
} from "model/types";

import { PersistDeleteFunction, PersistTransaction } from "./types";
import { cannotDeleteUncreatedModel } from "./error/cannotDeleteUncreatedModel";
import { cannotDeleteBlankId } from "./error/cannotDeleteBlankId";

export function deleteFactory<T extends ModelDataDefaultType>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistDeleteFunction<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    model: ReturnType<ModelFactoryWithPersist<T>> | string,
    trx: PersistTransaction = null
  ): Promise<boolean> {
    const id =
      typeof model === "string" ? model : model[modelFactory.primaryKey];
    const cnx = trx || connection;

    // Throw here with a more helpful error message -- we get here when a user passes in an unsaved model
    if (typeof model !== "string" && !id) {
      throw cannotDeleteUncreatedModel(model);
    }

    if (!model) {
      throw cannotDeleteBlankId();
    }

    const result = await cnx(tableName)
      .where(modelFactory.primaryKey, id)
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
