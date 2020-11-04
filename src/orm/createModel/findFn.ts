import { CreateModelArguments, CustomMethodOr, FindMethod } from "../types";

export function findFn<T extends CreateModelArguments>(
  def: T
): CustomMethodOr<T, "find", FindMethod<T>> {
  if (def.methods?.create) {
    return def.methods.create as CustomMethodOr<T, "find", FindMethod<T>>;
  }

  return ((partial) => {
    // TODO
  }) as CustomMethodOr<T, "find", FindMethod<T>>;
}
