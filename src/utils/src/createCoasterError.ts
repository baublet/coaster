import { CoasterError, ErrorDetails } from "./error";

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
  let newDetails = undefined;
  if (details && error) {
    newDetails = {
      ...details,
      error,
    };
  } else if (details && !error) {
    newDetails = details;
  } else if (!details && error) {
    newDetails = {
      error,
    };
  }

  return {
    __isCoasterError: true,
    code,
    message,
    details: newDetails,
  };
}
