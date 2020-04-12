import { countFactory } from "./count";
import { createFactory } from "./create";
import { deleteFactory } from "./delete";
import { findByFactory } from "./findBy";
import { findFactory } from "./find";
import { ModelFactory } from "model/types";
import { PersistedModelFactory, PersistModelArgs } from "./types";
import { queryFactory } from "./query";
import { updateFactory } from "./update";
import { relationships } from "./relationships";

import { createFactory as createRelationshipFactory } from "./relationships/create";
import { deleteAllFactory as deleteAllRelationshipFactory } from "./relationships/deleteAll";
import { createManyFactory } from "./relationships/createMany";
import { deleteRelationshipFactory } from "./relationships/delete";
import { findRelationshipFactory } from "./relationships/find";
import { findWhereRelationshipFactory } from "./relationships/findWhere";

export function attachPersistToModelFactory<T extends PersistModelArgs>(
  modelFactory: ModelFactory,
  opts: PersistModelArgs
): PersistedModelFactory<T> {
  // We want to do this so we can actually set the factories here. Otherwise,
  // TS would tell us we can't set readonly properties. By casting to any
  // and then back to the PersistedModelFactory, we don't lose any definition,
  // but we do lose some library-level type safety (particularly in the below
  // lines).
  const persistEnabledFactory = modelFactory as any;

  // Set our defaults
  const names = modelFactory.$names;
  const options = modelFactory.$options as PersistModelArgs;
  const persistOptions = options.persist;
  if (!persistOptions.primaryKey)
    persistEnabledFactory.$options.persist.primaryKey = "id";
  if (!persistOptions.tableName)
    persistEnabledFactory.$options.persist.tableName = names.pluralSafe;

  // Set our persist accessors
  persistEnabledFactory.count = countFactory(persistEnabledFactory);
  persistEnabledFactory.create = createFactory<T>(persistEnabledFactory);
  persistEnabledFactory.delete = deleteFactory<T>(persistEnabledFactory);
  persistEnabledFactory.find = findFactory<T>(persistEnabledFactory);
  persistEnabledFactory.findBy = findByFactory<T>(persistEnabledFactory);
  persistEnabledFactory.query = queryFactory<T>(persistEnabledFactory);
  persistEnabledFactory.update = updateFactory<T>(persistEnabledFactory);

  const builtRelationships = relationships(persistEnabledFactory, opts);
  persistEnabledFactory.$relationships = builtRelationships;

  builtRelationships.forEach(({ accessor }) => {
    persistEnabledFactory[accessor] = {
      create: createRelationshipFactory(persistEnabledFactory, accessor),
      createMany: createManyFactory(persistEnabledFactory, accessor),
      delete: deleteRelationshipFactory(persistEnabledFactory, accessor),
      deleteAll: deleteAllRelationshipFactory(persistEnabledFactory, accessor),
      find: findRelationshipFactory(persistEnabledFactory, accessor),
      findWhere: findWhereRelationshipFactory(persistEnabledFactory, accessor)
    };
  });

  return persistEnabledFactory as PersistedModelFactory<T>;
}
