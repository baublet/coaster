import { CoasterError } from "./error";

export function isCoasterError(value: unknown): value is CoasterError {
  if (typeof value === "object" && value && "__isCoasterError" in value) {
    return true;
  }
  return false;
}
