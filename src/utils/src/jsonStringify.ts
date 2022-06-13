import { assertIsError } from "./assertIsError";
import { createCoasterError } from "./createCoasterError";
import { CoasterError } from "./error";

export function jsonStringify(
  ...args: Parameters<typeof JSON["stringify"]>
): string | CoasterError {
  try {
    return JSON.stringify(...args);
  } catch (error) {
    assertIsError(error);
    return createCoasterError({
      code: `stringify`,
      message: `Failed to stringify`,
      error,
    });
  }
}
