import randomId from "uuid/v4";

import { Model, isModel, ModelFactoryArgsFromModelArgs } from "model/types";

import { cannotCreateExistingModel } from "./error/cannotCreateExistingModel";

import {
  PersistSaveFunction,
  PersistTransaction,
  PersistedModelFactory,
  PersistModelArgs
} from "./types";

export function createFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistSaveFunction<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;
  const primaryKey = persistOptions.primaryKey;

  return async function(
    initialData: Model<T> | ModelFactoryArgsFromModelArgs<T>,
    trx: PersistTransaction = null
  ): Promise<Model<T>> {
    // Create a model here if the user passes in raw data to "create"
    const model: Model = isModel(initialData)
      ? initialData
      : modelFactory(initialData);

    if (model[primaryKey]) {
      throw cannotCreateExistingModel(model);
    }

    const props = model.$baseValues;
    const cnx = trx || connection;

    const id = randomId();

    props[primaryKey] = id;
    await cnx(tableName).insert(props);

    return modelFactory.find(id);
  };
}
