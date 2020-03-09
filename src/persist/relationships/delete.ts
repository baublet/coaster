import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  PersistModelFactoryRelationsipDeleteFn
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";

export function deleteRelationshipFactory<Args extends PersistModelArgs>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationsipDeleteFn<Args> {
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
    ids: string | string[]
  ): Promise<number> {
    ids = Array.isArray(ids) ? ids : [ids];
    let deleted = 0;
    const localId = on[localPrimaryKey];

    const bridgeTableRows = await bridgeTablePersist(bridgeTableName)
      .where(localKey, "=", localId)
      .whereIn(foreignKey, ids)
      .select(foreignKey);

    const modelDeletions = bridgeTableRows.map(async row => {
      deleted++;
      return modelFactory.delete(row[foreignKey]);
    });

    await bridgeTablePersist(bridgeTableName)
      .where(localKey, "=", localId)
      .whereIn(foreignKey, ids)
      .delete();

    await Promise.all(modelDeletions);

    return deleted;
  };
}
