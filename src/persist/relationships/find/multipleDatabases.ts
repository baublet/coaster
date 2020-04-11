import { FindRelationshipStrategyOptions } from "./find";
import { PersistedModel, isPersistedModel } from "persist/types";

/**
 * If all the user wants to do is load all of the relationships, we can use the
 * modelFactory's dataLoader to load the relationships, potentially saving us
 * some round trips.
 */
function isSimpleMode(
  options: FindRelationshipStrategyOptions["options"]
): boolean {
  if (options.limit) return false;
  if (options.offset) return false;
  if (options.order) return false;
  return true;
}

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

  // In simple mode, the user is just requesting all of the relationships. We
  // can therefore use the built-in dataLoader to load them to save some round-
  // trips.
  if (isSimpleMode(options)) {
    const models = await modelFactory.dataLoader.loadMany(ids);
    // If there is even a single error, we want to throw here.
    for (const model of models) {
      if (!isPersistedModel(model)) {
        throw model;
      }
    }
    return models as Model[];
  }

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
