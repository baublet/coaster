import { Model } from "./createModel";
import { PersistAdapter } from "../persist";

export type ModelWithPersist<T> = T & {
  save: () => boolean;
  reload: () => boolean;
  delete: () => boolean;
};

export default function attachPersist<T>(
  model: Model<T>,
  adapter: PersistAdapter
): ModelWithPersist<T> {
  return {
    ...model,
    save: () => adapter.save(model),
    reload: () => adapter.reload(model),
    delete: () => adapter.delete(model)
  } as ModelWithPersist<T>;
}
