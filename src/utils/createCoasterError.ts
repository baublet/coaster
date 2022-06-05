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
export function createCoasterError(error: {
  code: string;
  message: string;
  details?: ErrorDetails;
  error?: Error;
}): CoasterError {
  return {
    __isCoasterError: true,
    code: base64encode(error.code),
    message: error.message,
  };
}
