import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistModelFactoryRelationsipDeleteAllFn,
  PersistedModel,
  PersistTransaction
} from "persist/types";
import { relationshipOptionsFor } from "./relationshipOptionsFor";
import { foreignAndBridgePersists } from "./foreignAndBridgePersists";

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
  return async function(
    on: PersistedModel<Args>,
    transaction?: PersistTransaction,
    bridgeTableTransaction?: PersistTransaction
  ): Promise<number> {
    let deleted = 0;
    const localPrimaryKey = on.$factory.$options.persist.primaryKey || "id";

    const { modelPersist, bridgePersist } = foreignAndBridgePersists({
      transaction,
      bridgeTableTransaction,
      bridgeTablePersist,
      modelFactory
    });

    const bridgeTableRows = await bridgePersist(bridgeTableName)
      .where(localKey, "=", on[localPrimaryKey])
      .select(foreignKey);

    await bridgePersist(bridgeTableName)
      .where(localKey, "=", on[localPrimaryKey])
      .delete();

    await Promise.all(
      bridgeTableRows.map(async row => {
        deleted++;
        return modelFactory.delete(row[foreignKey], modelPersist);
      })
    );

    return deleted;
  };
}
