import randomId from "uuid/v4";

import { ModelFactoryArgsFromModelArgs } from "model/types";

import { cannotCreateExistingModel } from "./error/cannotCreateExistingModel";

import {
  PersistSaveFunction,
  PersistTransaction,
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  isPersistedModel
} from "./types";

export function createFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistSaveFunction<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;
  const primaryKey = persistOptions.primaryKey;

  const beforeHooks = modelFactory.$options.hooks?.beforeCreate;
  const afterHooks = modelFactory.$options.hooks?.afterCreate;

  return async function(
    initialData: PersistedModel<T> | ModelFactoryArgsFromModelArgs<T>,
    trx: PersistTransaction = null
  ): Promise<PersistedModel<T>> {
    // Create a model here if the user passes in raw data to "create"
    const model: PersistedModel<T> = isPersistedModel(initialData)
      ? initialData
      : modelFactory(initialData);

    if (model[primaryKey]) {
      throw cannotCreateExistingModel(model);
    }

    if (beforeHooks) beforeHooks.forEach(hook => hook(model));

    const data = modelFactory.$data(model);
    const cnx = trx || connection;

    data[primaryKey] = randomId();
    await cnx(tableName).insert(data);

    // We need to 'any' here because TS can't know when we're here that
    // primaryKey properly indexes model
    (model as any)[primaryKey] = data[primaryKey];

    if (afterHooks) afterHooks.forEach(hook => hook(model));

    return model;
  };
}
