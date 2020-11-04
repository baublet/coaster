import { CreateModelArguments, CustomMethodOr, CreateMethod } from "../types";

export function createFn<T extends CreateModelArguments>(
  def: T
): CustomMethodOr<T, "create", CreateMethod<T>> {
  if (def.methods?.create) {
    return def.methods.create as CustomMethodOr<T, "create", CreateMethod<T>>;
  }

  return ((partial) => {
    const modelWithDefaults = { ...partial };
    for (const [key, definition] of Object.entries(def.properties)) {
      if (!(key in modelWithDefaults)) {
        modelWithDefaults[key] = definition.default;
      }
    }
    return Promise.resolve(modelWithDefaults);
  }) as CustomMethodOr<T, "create", CreateMethod<T>>;
}
