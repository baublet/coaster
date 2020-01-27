import {
  Model,
  ModelInternalProperties,
  ModelFactoryWithPersist,
  ModelDataDefaultType
} from "model/types";

import { cannotUpdateNewModel } from "./error/cannotUpdateNewModel";
import { PersistTransaction, PersistSaveFunction } from "./types";

export function updateFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistSaveFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function(
    model: Model<T & C>,
    trx: PersistTransaction = null
  ): Promise<Model<T & C>> {
    const props = ((model as any) as ModelInternalProperties).$nativeProperties();
    const id = model.id;
    const cnx = trx || connection;
    if (!id) {
      throw cannotUpdateNewModel(model);
    }

    await cnx(tableName)
      .where("id", "=", id)
      .update(props);

    const result = await cnx<T>(tableName)
      .select("*")
      .where("id", "=", id)
      .limit(1);

    if (result[0]) {
      return modelFactory(result[0] as T);
    } else {
      return model;
    }
  };
}
