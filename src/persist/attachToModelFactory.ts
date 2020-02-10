import { countFactory } from "./count";
import { createFactory } from "./create";
import { deleteFactory } from "./delete";
import { findByFactory } from "./findBy";
import { findFactory } from "./find";
import {
  ModelFactoryWithPersist,
  ModelFactory,
  ModelDataPropTypes
} from "model/types";
import { PersistConnection } from "./types";
import { queryFactory } from "./query";
import { updateFactory } from "./update";

export function attachPersistToModelFactory<T extends ModelDataPropTypes>(
  modelFactory: ModelFactory<T>,
  persist: PersistConnection
): ModelFactoryWithPersist<T> {
  const persistEnabledFactory = modelFactory as ModelFactoryWithPersist<T>;
  persistEnabledFactory.persistWith = persist;
  persistEnabledFactory.count = countFactory(persistEnabledFactory);
  persistEnabledFactory.create = createFactory<T>(persistEnabledFactory);
  persistEnabledFactory.delete = deleteFactory<T>(persistEnabledFactory);
  persistEnabledFactory.find = findFactory<T>(persistEnabledFactory);
  persistEnabledFactory.findBy = findByFactory<T>(persistEnabledFactory);
  persistEnabledFactory.query = queryFactory<T>(persistEnabledFactory);
  persistEnabledFactory.update = updateFactory<T>(persistEnabledFactory);
  return persistEnabledFactory;
}
