import { FindRelationshipStrategyOptions } from "./find";
import { PersistedModel } from "persist/types";

export async function findRelationshipsMultipleDatabases<
  Model extends PersistedModel
>({
  bridgeTableName,
  bridgeTablePersist,
  foreignKey,
  foreignPersist,
  foreignPrimaryKey,
  localKey,
  localPrimaryKey,
  modelFactory,
  on,
  options
}: FindRelationshipStrategyOptions): Promise<Model[]> {
  const localId = on[localPrimaryKey];
  const foreignTableName = modelFactory.$options.persist.tableName;
  const columns = options.columns || ["*"];

  const bridgeTableRows = await bridgeTablePersist(bridgeTableName)
    .where(localKey, "=", localId)
    .select(foreignKey);

  const ids = bridgeTableRows.map(row => row[foreignKey]);

  const modelData = foreignPersist(foreignTableName).whereIn(
    foreignPrimaryKey,
    ids
  );

  if (options.limit) {
    modelData.limit(options.limit);
  }

  if (options.offset) {
    modelData.offset(options.offset);
  }

  if (options.order) {
    options.order.forEach(order =>
      modelData.orderBy(order.by, order.direction)
    );
  }

  const data = await modelData.select(columns);
  const models = data.map(modelFactory);

  return models as Model[];
}
