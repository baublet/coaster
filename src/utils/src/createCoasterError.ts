import stringify from "safe-json-stringify";

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
  error?: Error | CoasterError | any;
}): CoasterError {
  const errorObject = error.error;
  let syntheticError: CoasterError["error"] = undefined;

  if (errorObject === undefined || errorObject === null) {
    syntheticError = undefined;
  } else if (isCoasterError(errorObject)) {
    syntheticError = {
      message:
        errorObject.message +
        (!errorObject.error?.message ? "" : `\n${errorObject.error.message}`),
      stack: errorObject.error?.stack,
    };
  } else if (errorObject instanceof Error) {
    syntheticError = {
      message: stringify({
        message: errorObject.message,
        stack: errorObject.stack,
        name: errorObject.name,
      }),
    };
  } else {
    syntheticError = { message: stringify(errorObject) };
  }

  return {
    __isCoasterError: true,
    code: base64encode(error.code),
    message: error.message,
    error: syntheticError,
  };
}
