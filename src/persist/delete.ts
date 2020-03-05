import {
  PersistDeleteFunction,
  PersistTransaction,
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel
} from "./types";
import { cannotDeleteUncreatedModel } from "./error/cannotDeleteUncreatedModel";
import { cannotDeleteBlankId } from "./error/cannotDeleteBlankId";

export function deleteFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistDeleteFunction<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;
  const primaryKey = persistOptions.primaryKey;

  const beforeHooks = modelFactory.$options.hooks?.beforeDelete;
  const afterHooks = modelFactory.$options.hooks?.afterDelete;

  return async function(
    model: PersistedModel<T> | string,
    trx: PersistTransaction = null
  ): Promise<boolean> {
    const id = typeof model === "string" ? model : model[primaryKey];
    const cnx = trx || connection;

    // Throw here with a more helpful error message - we get here when a user
    // passes in an unsaved model
    if (typeof model !== "string" && !id) {
      throw cannotDeleteUncreatedModel(model);
    }

    if (!model) {
      throw cannotDeleteBlankId();
    }

    if (beforeHooks) beforeHooks.forEach(hook => hook(model));

    const result = await cnx(tableName)
      .where(primaryKey, id)
      .delete()
      .limit(1);

    if (afterHooks) afterHooks.forEach(hook => hook(model));

    if (result) {
      return true;
    }
    return false;
  };
}
