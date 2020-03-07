import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistModelFactoryRelationsipDeleteAllFn,
  PersistedModel,
  PersistModelFactoryRelationsipCreateManyFn,
  PersistModelFactoryRelationsipCreateFn,
  isPersistedModel
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";

export function createFactory<
  Args extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationsipCreateFn<Args, ForeignFactory> {
  const {
    bridgeTableName,
    bridgeTablePersist,
    localKey,
    foreignKey,
    modelFactory
  } = relationshipOptionsFor(baseFactory.$relationships, relationship);
  const localPrimaryKey = modelFactory.$options.persist.primaryKey || "id";
  const foreignPrimaryKey = baseFactory.$options.persist.primaryKey || "id";
  return async function(
    on: PersistedModel<Args>,
    model: ReturnType<ForeignFactory> | Partial<Parameters<ForeignFactory>>,
    validate: boolean = true
  ): Promise<ReturnType<ForeignFactory>> {
    const dataAsModel = isPersistedModel(model) ? model : modelFactory(model);

    if (validate) {
      const [valid, errors] = modelFactory.validate(dataAsModel);
      if (!valid) throw errors;
    }

    // Save the new model if it's not already saved
    const newModel = dataAsModel[localPrimaryKey]
      ? dataAsModel
      : await modelFactory.create(dataAsModel);

    await bridgeTablePersist(bridgeTableName).insert({
      [localKey]: on[localPrimaryKey],
      [foreignKey]: newModel[foreignPrimaryKey]
    });

    return newModel as ReturnType<ForeignFactory>;
  };
}
