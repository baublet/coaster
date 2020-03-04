import { createModel as baseModelFactory } from "model/createModel";
import { PersistModelArgs, PersistedModelFactory } from "./types";
import { attachPersistToModelFactory } from "./attachToModelFactory";

export function createPersistedModel<Args extends PersistModelArgs>(
  opts: Args
): PersistedModelFactory<Args> {
  const baseModel = baseModelFactory(opts);

  return attachPersistToModelFactory(baseModel, opts) as PersistedModelFactory<
    Args
  >;
}
