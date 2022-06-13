import { CoasterError, ErrorDetails } from "./error";
import { base64encode } from "./base64encode";
import { isCoasterError } from "./isCoasterError";

/**
 * Creates a CoasterError that includes a message and an opaque code. Developers
 * are able to use the code to trace the error down to a specific line in the
 * source code.
 *
 * @param error Error code and message
 * @returns CoasterError
 */
export function createCoasterError(error: {
  code: string;
  message: string;
  details?: ErrorDetails;
  error?: Error | CoasterError;
}): CoasterError {
  const errorObject = error.error;
  return {
    __isCoasterError: true,
    code: base64encode(error.code),
    message: error.message,
    error: !errorObject
      ? undefined
      : isCoasterError(errorObject)
      ? errorObject
      : { message: errorObject.message, stack: errorObject.stack },
  };
}
