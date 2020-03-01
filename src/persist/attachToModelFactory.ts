import { countFactory } from "./count";
import { createFactory } from "./create";
import { deleteFactory } from "./delete";
import { findByFactory } from "./findBy";
import { findFactory } from "./find";
import { ModelFactory } from "model/types";
import { PersistedModelFactory, PersistModelArgs } from "./types";
import { queryFactory } from "./query";
import { updateFactory } from "./update";

export function attachPersistToModelFactory<T extends PersistModelArgs>(
  modelFactory: ModelFactory
): PersistedModelFactory<T> {
  // We want to do this so we can actually set the factories here. Otherwise,
  // TS would tell us we can't set readonly properties. By casting to any
  // and then back to the PersistedModelFactory, we don't lose any definition,
  // but we do lose some library-level type safety (particularly in the below
  // lines).
  const persistEnabledFactory = modelFactory as any;

  // Set our persist accessors
  persistEnabledFactory.count = countFactory(persistEnabledFactory);
  persistEnabledFactory.create = createFactory<T>(persistEnabledFactory);
  persistEnabledFactory.delete = deleteFactory<T>(persistEnabledFactory);
  persistEnabledFactory.find = findFactory<T>(persistEnabledFactory);
  persistEnabledFactory.findBy = findByFactory<T>(persistEnabledFactory);
  persistEnabledFactory.query = queryFactory<T>(persistEnabledFactory);
  persistEnabledFactory.update = updateFactory<T>(persistEnabledFactory);

  // Set our defaults
  const names = modelFactory.$names;
  const options = modelFactory.$options as PersistModelArgs;
  const persistOptions = options.persist;
  if (!persistOptions.primaryKey) persistOptions.primaryKey = "id";
  if (!persistOptions.tableName) persistOptions.tableName = names.pluralSafe;

  return persistEnabledFactory as PersistedModelFactory<T>;
}
