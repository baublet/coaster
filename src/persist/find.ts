import { ModelFactoryWithPersist, ModelDataPropTypes } from "model/types";

import { PersistFindQueryOptions, PersistFindFunction } from "./types";
import { cannotFindByBlankId } from "./error/cannotFindBlankId";
import { loadRelationships } from "./loadRelationships";

export function findFactory<T extends ModelDataPropTypes>(
  modelFactory: ModelFactoryWithPersist<T>
): PersistFindFunction<T> {
  const tableName = modelFactory.tableName;
  const connection = modelFactory.persistWith;

  return async function find(
    id: string | string[],
    {
      columns = ["*"],
      eager = true,
      persist = null
    }: PersistFindQueryOptions = {}
  ): Promise<
    | ReturnType<ModelFactoryWithPersist<T>>
    | null
    | (ReturnType<ModelFactoryWithPersist<T>> | null)[]
  > {
    const cnx = persist || connection;
    const depth = typeof eager === "boolean" ? 0 : eager - 1;

    if (Array.isArray(id)) {
      const query = cnx<T>(tableName)
        .whereIn(modelFactory.primaryKey, id)
        .select(...columns);
      const results = await query;

      // This ensures that our slots are preserved, e.g., `find(1, 2, 3)`,
      // returns `[1, null, 3]` if "2" doesn't exist.
      const resultsAsModels: (ReturnType<
        ModelFactoryWithPersist<T>
      > | null)[] = id.map(id => {
        for (const result of results) {
          if (result[modelFactory.primaryKey] === id)
            return modelFactory(result as T);
        }
        return null;
      });
      if (eager) {
        await loadRelationships(resultsAsModels.filter(Boolean), cnx, depth);
      }
      return resultsAsModels;
    }

    if (!id) {
      throw cannotFindByBlankId();
    }

    const results = await cnx<T>(tableName)
      .where(modelFactory.primaryKey, "=", id)
      .select(...columns)
      .limit(1);

    if (results[0]) {
      const model = modelFactory(results[0] as T) as ReturnType<
        ModelFactoryWithPersist<T>
      >;
      if (eager) {
        await loadRelationships([model], cnx, depth);
      }
      return model;
    }
    return null;
    /**
     * TODO: I'm not sure why we need to cast this. The TS error is not helpful
     * in this instance:
     *
     * 'Model<T>[]' is assignable to the constraint of type 'T', but 'T' could
     * be instantiated with a different subtype of constraint 'Record<string,
     * any>'.
     *
     * I don't see any obvious places where we could have instantiated T with
     * another sybtype /shrug.
     */
  } as PersistFindFunction<T>;
}
