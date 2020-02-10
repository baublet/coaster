import {
  ModelInternalProperties,
  ModelFactoryWithPersist,
  isModel,
  ModelDataPropTypes
} from "model/types";

import { cannotUpdateNewModel } from "./error/cannotUpdateNewModel";
import { PersistTransaction, PersistSaveFunction } from "./types";
import { cannotUpdateWithoutPrimaryKey } from "./error/cannotUpdateWithoutPrimaryKey";

export function updateFactory<T extends ModelDataPropTypes>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistSaveFunction<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function update(
    initialData: ReturnType<ModelFactoryWithPersist<T>> | Partial<T>,
    trx: PersistTransaction = null
  ) {
    // If they pass in data, we assume they want to update it.
    if (!isModel(initialData)) {
      if (initialData[modelFactory.primaryKey])
        throw cannotUpdateWithoutPrimaryKey(modelFactory, initialData);
    }

    const model = isModel(initialData)
      ? initialData
      : (modelFactory(initialData) as ReturnType<ModelFactoryWithPersist<T>>);
    const props = ((model as unknown) as ModelInternalProperties).$nativeProperties();
    const id = model[modelFactory.primaryKey];
    const cnx = trx || connection;
    if (!id) {
      throw cannotUpdateNewModel(model);
    }

    await cnx(tableName)
      .where(modelFactory.primaryKey, "=", id)
      .update(props);

    const result = await cnx<T>(tableName)
      .select("*")
      .where(modelFactory.primaryKey, "=", id)
      .limit(1);

    if (result[0]) {
      return modelFactory(result[0] as T) as ReturnType<
        ModelFactoryWithPersist<T>
      >;
    } else {
      return model;
    }
  };
}
