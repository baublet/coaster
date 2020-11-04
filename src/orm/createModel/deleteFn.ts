import { CreateModelArguments, CustomMethodOr, DeleteMethod } from "../types";

export function deleteFn<T extends CreateModelArguments>(
  def: T
): CustomMethodOr<T, "delete", DeleteMethod<T>> {
  if (def.methods?.create) {
    return def.methods.create as CustomMethodOr<T, "delete", DeleteMethod<T>>;
  }

  return ((partial) => {
    // TODO
  }) as CustomMethodOr<T, "delete", DeleteMethod<T>>;
}
