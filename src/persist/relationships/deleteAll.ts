import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistModelFactoryRelationsipDeleteAllFn,
  PersistedModel
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";

export function deleteAllFactory<Args extends PersistModelArgs>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationsipDeleteAllFn<Args> {
  const {
    bridgeTableName,
    bridgeTablePersist,
    localKey,
    foreignKey,
    modelFactory
  } = relationshipOptionsFor(baseFactory.$relationships, relationship);
  return async function(on: PersistedModel<Args>): Promise<number> {
    let deleted = 0;
    const localPrimaryKey = on.$factory.$options.persist.primaryKey || "id";
    const bridgeTableRows = await bridgeTablePersist(bridgeTableName)
      .where(localKey, "=", on[localPrimaryKey])
      .select(foreignKey);

    const modelDeletions = bridgeTableRows.map(async row => {
      deleted++;
      return modelFactory.delete(row[foreignKey]);
    });

    await bridgeTablePersist(bridgeTableName)
      .where(localKey, "=", on[localPrimaryKey])
      .delete();

    await Promise.all(modelDeletions);

    return deleted;
  };
}
