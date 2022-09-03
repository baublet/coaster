import { CoasterError } from "./error";
import { isCoasterError } from "./isCoasterError";

export function arrayHasNoCoasterErrors<T>(
  array: T[]
): array is Exclude<T, CoasterError>[] {
  return array.every((item) => !isCoasterError(item));
}
