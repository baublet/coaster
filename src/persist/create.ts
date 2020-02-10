import randomId from "uuid/v4";

import {
  Model,
  ModelInternalProperties,
  ModelFactoryWithPersist,
  isModel,
  ModelDataPropTypes
} from "model/types";

import { cannotCreateExistingModel } from "./error/cannotCreateExistingModel";

import { PersistSaveFunction, PersistTransaction } from "./types";

export function createFactory<T extends ModelDataPropTypes>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistSaveFunction<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    initialData: ReturnType<ModelFactoryWithPersist<T>> | Partial<T>,
    trx: PersistTransaction = null
  ): Promise<ReturnType<ModelFactoryWithPersist<T>>> {
    // Create a model here if the user passes in raw data to "create"
    const model: Model = isModel(initialData)
      ? initialData
      : modelFactory(initialData);

    if (model[modelFactory.primaryKey]) {
      throw cannotCreateExistingModel(model);
    }

    const internalProps: ModelInternalProperties = model as any;
    const props = internalProps.$nativeProperties();
    const cnx = trx || connection;

    let id: string;
    while (typeof id !== "string") {
      const idToCheck = randomId();
      const found = await cnx(tableName)
        .where("id", "=", idToCheck)
        .select("id");
      if (found.length) continue;
      id = idToCheck;
    }

    props[modelFactory.primaryKey] = id;
    await cnx(tableName).insert(props);

    return modelFactory.find(id);
  };
}
