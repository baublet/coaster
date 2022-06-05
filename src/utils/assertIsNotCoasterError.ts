import { CoasterError } from "./error";
import { isCoasterError } from "./isCoasterError";

export function assertIsNotCoasterError<T>(
  subject: T
): asserts subject is Exclude<T, CoasterError> {
  if (isCoasterError(subject)) {
    throw new Error(
      `Expected subject to be a non-coaster error, but it was a coaster error: ${JSON.stringify(
        subject
      )}`
    );
  }
}
