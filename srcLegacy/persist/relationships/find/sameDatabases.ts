import { FindRelationshipStrategyOptions } from "./find";
import { PersistedModel } from "persist/types";

export async function findRelationshipsSameDatabase<
  Model extends PersistedModel
>({
  bridgeTableName,
  foreignKey,
  foreignPersist: persist,
  localPrimaryKey,
  localKey,
  modelFactory,
  on,
  foreignPrimaryKey,
  options
}: FindRelationshipStrategyOptions): Promise<Model[]> {
  const localId = on[localPrimaryKey];
  const foreignTableName = modelFactory.$options.persist.tableName;
  const columns = (options.columns || ["*"]).map(
    col => `${foreignTableName}.${col}`
  );

  const modelData = persist
    .from(foreignTableName)
    .join(bridgeTableName, function() {
      this.on(
        `${bridgeTableName}.${foreignKey}`,
        "=",
        `${foreignTableName}.${foreignPrimaryKey}`
      );
    })
    .where(`${bridgeTableName}.${localKey}`, localId);

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
