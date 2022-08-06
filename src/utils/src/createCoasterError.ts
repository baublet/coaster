import { CoasterError, ErrorDetails } from "./error";
import { base64encode } from "./base64encode";

/**
 * Creates a CoasterError that includes a message and an opaque code. Developers
 * are able to use the code to trace the error down to a specific line in the
 * source code.
 *
 * @param error Error code and message
 * @returns CoasterError
 */
export function createCoasterError({
  code,
  message,
  details,
  error,
}: {
  code: string;
  message: string;
  details?: ErrorDetails;
  error?: Error | CoasterError | any;
}): CoasterError {
  const errorSynthetic: CoasterError["error"] = { message: error };
  if (typeof error === "object" && error) {
    if (error instanceof Error) {
      errorSynthetic.message = error.message;
      errorSynthetic.stack = error.stack;
    } else {
      errorSynthetic.message = error?.message;
      errorSynthetic.stack = error?.stack;
    }
  }

  return {
    __isCoasterError: true,
    code: base64encode(code),
    message: message,
    details: details,
    error: errorSynthetic,
  };
}
