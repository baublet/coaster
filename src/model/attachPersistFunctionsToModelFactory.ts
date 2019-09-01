import { ModelFactory, Model } from "./createModel";
import {
  PersistAdapter,
  PersistFindByProps,
  PersistDeleteQuery,
  PersistMatcherType
} from "persist";
import log from "helpers/log";

export interface ModelFactoryPersistFunctions {
  deleteBy: (query: PersistDeleteQuery) => Promise<number>;
  find: (
    id: number | string | number[] | string[]
  ) => Promise<Model | Model[] | null>;
  findBy: (props: PersistFindByProps) => Promise<Model[]>;
}

export default function attachPersistFunctionsToModelFactory(
  factory: ModelFactory<any, any>,
  adapter: PersistAdapter
): void {
  const persistFunctions: ModelFactoryPersistFunctions = {
    find: async (
      id: number | string | number[] | string[]
    ): Promise<Model | Model[] | null> => {
      const results = await adapter.findBy({
        query: {
          $model: factory,
          id: Array.isArray(id) ? [PersistMatcherType.ONE_OF, id] : id
        }
      });

      if (!results.length) {
        return null;
      }

      if (Array.isArray(id)) {
        return results;
      }

      return results[0];
    },
    findBy: adapter.findBy,
    deleteBy: adapter.deleteBy
  };

  // Attach them
  Object.assign(factory, persistFunctions);
}
