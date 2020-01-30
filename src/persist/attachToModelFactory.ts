import { countFactory } from "./count";
import { createFactory } from "./create";
import { deleteFactory } from "./delete";
import { findByFactory } from "./findBy";
import { findFactory } from "./find";
import { ModelFactoryWithPersist, ModelFactory } from "model/types";
import { PersistConnection } from "./types";
import { queryFactory } from "./query";
import { updateFactory } from "./update";
import { findManyFactory } from "./findMany";

export function attachPersistToModelFactory<T, C>(
  modelFactory: ModelFactory<T, C>,
  persist: PersistConnection
): ModelFactoryWithPersist<T, C> {
  const persistFactory: ModelFactoryWithPersist<T, C> = modelFactory as any;
  persistFactory.persistWith = persist;
  persistFactory.count = countFactory(persistFactory);
  persistFactory.create = createFactory<T, C>(persistFactory);
  persistFactory.delete = deleteFactory<T, C>(persistFactory);
  persistFactory.find = findFactory<T, C>(persistFactory);
  persistFactory.findBy = findByFactory<T, C>(persistFactory);
  persistFactory.findMany = findManyFactory<T, C>(persistFactory);
  persistFactory.query = queryFactory<T, C>(persistFactory);
  persistFactory.update = updateFactory<T, C>(persistFactory);
  return persistFactory;
}
