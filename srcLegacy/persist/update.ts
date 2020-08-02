import { cannotUpdateNewModel } from "./error/cannotUpdateNewModel";
import {
  PersistTransaction,
  PersistSaveFunction,
  PersistModelArgs,
  PersistedModelFactory,
  PersistedModel,
  isPersistedModel
} from "./types";
import { cannotUpdateWithoutPrimaryKey } from "./error/cannotUpdateWithoutPrimaryKey";
import { ModelFactoryArgsFromModelArgs } from "model/types";

export function updateFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistSaveFunction<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;
  const primaryKey = persistOptions.primaryKey;

  return async function update(
    initialData: PersistedModel<T> | ModelFactoryArgsFromModelArgs<T>,
    trx: PersistTransaction = null
  ) {
    // If they pass in data, we assume they want to update it.
    if (!isPersistedModel(initialData)) {
      if (!initialData[primaryKey])
        throw cannotUpdateWithoutPrimaryKey(modelFactory, initialData);
    }

    const model = isPersistedModel(initialData)
      ? initialData
      : modelFactory(initialData);
    const props = model.$initialValues;
    const id = model[primaryKey];
    const cnx = trx || connection;
    if (!id) {
      throw cannotUpdateNewModel(model);
    }

    await cnx(tableName)
      .where(primaryKey, "=", id)
      .update(props);

    if (isPersistedModel(model)) {
      return model;
    }

    const result = await cnx(tableName)
      .select("*")
      .where(primaryKey, "=", id)
      .limit(1);

    return modelFactory(result[0] as ModelFactoryArgsFromModelArgs<T>);
  };
}