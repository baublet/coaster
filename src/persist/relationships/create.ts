import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  PersistModelFactoryRelationshipCreateFn,
  isPersistedModel,
  PersistTransaction
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";
import { foreignAndBridgePersists } from "./foreignAndBridgePersists";

export function createFactory<
  Args extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationshipCreateFn<Args, ForeignFactory> {
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
    validate: boolean = true,
    transaction?: PersistTransaction,
    bridgeTableTransaction?: PersistTransaction
  ): Promise<ReturnType<ForeignFactory>> {
    const dataAsModel = isPersistedModel(model) ? model : modelFactory(model);

    if (validate) {
      const [valid, errors] = modelFactory.validate(dataAsModel);
      if (!valid) throw errors;
    }

    const { modelPersist, bridgePersist } = foreignAndBridgePersists({
      transaction,
      bridgeTableTransaction,
      bridgeTablePersist,
      modelFactory
    });

    // Save the new model if it's not already saved
    const newModel = dataAsModel[localPrimaryKey]
      ? dataAsModel
      : await modelFactory.create(dataAsModel, modelPersist);

    await bridgePersist(bridgeTableName).insert({
      [localKey]: on[localPrimaryKey],
      [foreignKey]: newModel[foreignPrimaryKey]
    });

    return newModel as ReturnType<ForeignFactory>;
  };
}
