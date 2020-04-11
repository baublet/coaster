import {
  PersistFindFunction,
  PersistModelArgs,
  PersistedModelFactory,
  PersistedModel
} from "./types";
import { cannotFindByBlankId } from "./error/cannotFindBlankId";

export function findFactory<T extends PersistModelArgs>(
  modelFactory: PersistedModelFactory<T>
): PersistFindFunction<T> {
  return async function(
    id: string | string[]
  ): Promise<PersistedModel<T> | Error | (PersistedModel<T> | Error)[]> {
    if (!id) {
      throw cannotFindByBlankId();
    }

    return Array.isArray(id)
      ? modelFactory.dataLoader.loadMany(id)
      : modelFactory.dataLoader.load(id);

    /**
     * TODO: I'm not sure why we need to cast this. The TS error is not helpful
     * in this instance:
     *
     * 'Model<T>[]' is assignable to the constraint of type 'T', but 'T' could
     * be instantiated with a different subtype of constraint 'Record<string,
     * any>'.
     *
     * I don't see any obvious places where we could have instantiated T with
     * another subtype /shrug.
     */
  } as PersistFindFunction<T>;
}
