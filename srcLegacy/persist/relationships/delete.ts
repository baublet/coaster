import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  PersistModelFactoryRelationshipDeleteFn,
  PersistTransaction
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";
import { foreignAndBridgePersists } from "./foreignAndBridgePersists";

export function deleteRelationshipFactory<Args extends PersistModelArgs>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationshipDeleteFn<Args> {
  const {
    bridgeTableName,
    bridgeTablePersist,
    localKey,
    foreignKey,
    modelFactory
  } = relationshipOptionsFor(baseFactory.$relationships, relationship);
  const localPrimaryKey = baseFactory.$options.persist.primaryKey || "id";
  return async function(
    on: PersistedModel<Args>,
    ids: string | string[],
    transaction?: PersistTransaction,
    bridgeTableTransaction?: PersistTransaction
  ): Promise<number> {
    ids = Array.isArray(ids) ? ids : [ids];
    let deleted = 0;
    const localId = on[localPrimaryKey];

    const { modelPersist, bridgePersist } = foreignAndBridgePersists({
      transaction,
      bridgeTableTransaction,
      bridgeTablePersist,
      modelFactory
    });

    const bridgeTableRows = await bridgePersist(bridgeTableName)
      .where(localKey, "=", localId)
      .whereIn(foreignKey, ids)
      .select(foreignKey);

    const modelDeletions = bridgeTableRows.map(async row => {
      deleted++;
      return modelFactory.delete(row[foreignKey], modelPersist);
    });

    await bridgePersist(bridgeTableName)
      .where(localKey, "=", localId)
      .whereIn(foreignKey, ids)
      .delete();

    await Promise.all(modelDeletions);

    return deleted;
  };
}
