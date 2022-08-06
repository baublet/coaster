import { createCoasterError } from "./createCoasterError";
import { CoasterError } from "./error";

/**
 * Given a sync or async function, wraps the work to perform in a try/catch block,
 * and if the functions throws, returns a CoasterError. Otherwise, returns the
 * function's returned or resolved value. Useful for wrapping non-Coaster code
 * that may throw errors.
 */
export async function perform<T extends () => any>(
  callback: T
): Promise<
  (ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>) | CoasterError
> {
  try {
    return await callback();
  } catch (error) {
    return createCoasterError({
      code: "perform-error",
      message: "Error performing function",
      error,
    });
  }
}
