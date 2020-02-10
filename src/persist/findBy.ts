import { ModelFactoryWithPersist, ModelDataDefaultType } from "model/types";

import { PersistFindByFunction, PersistFindQueryOptions } from "./types";
import { loadRelationships } from "./loadRelationships";

export function findByFactory<T extends ModelDataDefaultType>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistFindByFunction<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function findBy(
    by: Record<string, string | number | boolean>,
    {
      columns = ["*"],
      eager = true,
      limit = undefined,
      offset = undefined,
      order = undefined,
      persist = null
    }: PersistFindQueryOptions = {}
  ) {
    const cnx = persist || connection;

    const query = cnx<T>(tableName)
      .where(by)
      .select(...columns);
    if (limit !== undefined) query.limit(limit);
    if (offset !== undefined) query.offset(offset);
    if (order !== undefined)
      order.forEach(({ by, direction = "asc" }) =>
        query.orderBy(by, direction)
      );

    const results = await query;
    const models = results.map(
      data => modelFactory(data as T) as ReturnType<ModelFactoryWithPersist<T>>
    );

    if (eager) {
      const depth = typeof eager === "boolean" ? 0 : eager - 1;
      await loadRelationships(models, cnx, depth);
    }

    return models;
  };
}
