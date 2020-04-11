import DataLoader from "dataloader";

import {
  PersistModelArgs,
  PersistedModelFactory,
  PersistedModel
} from "./types";
import { ModelFactoryArgsFromModelArgs } from "model/types";

/**
 * Creates a dataLoader for loading the full row of a particular model. Does
 * _not_ ever load or cache relationships.
 */
export function dataLoaderFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): DataLoader<string, PersistedModel<T>> {
  const persistOptions = modelFactory.$options.persist;
  const tableName = persistOptions.tableName;
  const connection = persistOptions.with;
  const primaryKey = persistOptions.primaryKey;

  return new DataLoader<string, PersistedModel<T>>(async function(
    ids: string[]
  ): Promise<PersistedModel<T>[]> {
    const query = connection<T>(tableName)
      .whereIn(primaryKey, ids)
      .select(["*"]);
    const results = await query;

    // This ensures that our slots are preserved, e.g., `find(1, 2, 3)`,
    // returns `[1, null, 3]` if "2" doesn't exist.
    const resultsAsModels: (PersistedModel<T> | null)[] = ids.map(id => {
      for (const result of results) {
        if (result[primaryKey] === id)
          return modelFactory(result as ModelFactoryArgsFromModelArgs<T>);
      }
      return null;
    });
    return resultsAsModels;
  });
}
