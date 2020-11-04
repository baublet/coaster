import {
  CreateModelArguments,
  CustomMethodOr,
  SaveMethod,
  ModelDetails,
} from "../types";

export function saveFn<T extends CreateModelArguments>(
  def: T,
  _model: ModelDetails<T>
): CustomMethodOr<T, "save", SaveMethod<T>> {
  if (def.methods?.create) {
    return def.methods.create as CustomMethodOr<T, "save", SaveMethod<T>>;
  }

  return ((partial) => {
    // TODO
  }) as CustomMethodOr<T, "save", SaveMethod<T>>;
}
