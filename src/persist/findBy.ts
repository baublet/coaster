import {
  PersistFindByFunction,
  PersistFindQueryOptions,
  PersistModelArgs,
  PersistedModelFactory
} from "./types";
import { loadRelationships } from "./loadRelationships";
import { ModelFactoryArgsFromModelArgs } from "model/types";

export function findByFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistFindByFunction<T> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;

  return async function findBy(
    by: Partial<ModelFactoryArgsFromModelArgs<T>>,
    {
      columns = ["*"],
      eager = true,
      limit = undefined,
      offset = undefined,
      order = undefined
    }: PersistFindQueryOptions = {}
  ) {
    const query = connection<T>(tableName)
      .where(by)
      .select(...columns);
    if (limit !== undefined) query.limit(limit);
    if (offset !== undefined) query.offset(offset);
    if (order !== undefined)
      order.forEach(({ by, direction = "asc" }) =>
        query.orderBy(by, direction)
      );

    const results = await query;
    const models = results.map(data =>
      modelFactory(data as ModelFactoryArgsFromModelArgs<T>)
    );

    if (eager) {
      await loadRelationships(models, eager);
    }

    return models;
  };
}
