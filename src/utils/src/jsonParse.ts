import { createCoasterError } from "./createCoasterError";
import { CoasterError } from "./error";

export function jsonParse(
  ...args: Parameters<typeof JSON["parse"]>
): unknown | CoasterError {
  try {
    return JSON.parse(...args);
  } catch (error) {
    return createCoasterError({
      code: `parse`,
      message: `Failed to parse`,
      error,
    });
  }
}
