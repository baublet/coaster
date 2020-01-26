import randomId from "uuid/v4";

import {
  Model,
  ModelInternalProperties,
  ModelFactoryWithPersist,
  ModelDataDefaultType
} from "model/types";

import { cannotCreateExistingModel } from "./error/cannotCreateExistingModel";

import { PersistSaveFunction, PersistTransaction } from "./types";

export function createFactory<T extends ModelDataDefaultType, C>(
  modelFactory: ModelFactoryWithPersist<T, C>
): PersistSaveFunction<T, C> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function create(
    model: Model<T & C>,
    trx: PersistTransaction = null
  ): Promise<Model<T & C>> {
    if (model.id) {
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

    const result = await cnx(tableName)
      .insert(props)
      .returning("*");

    if (result && result[0]) {
      return modelFactory(result[0] as T);
    }

    return modelFactory.find(id);
  };
}
