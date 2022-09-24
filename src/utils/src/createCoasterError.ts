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
  previousError,
  error: properError,
}: {
  code: string;
  message: string;
  details?: ErrorDetails;
  error?: unknown;
  previousError?: CoasterError;
}): CoasterError {
  const error = previousError || {
    __isCoasterError: true,
    code,
    message,
    details,
    time: Date.now(),
  };

  if (previousError) {
    error.code = error.code + "\n → " + code;
    error.message = error.message + "\n → " + message;
    error.details = {
      ...details,
      previous: previousError.details,
    };
  }

  if (!error.details) {
    error.details = {};
  }

  if (isObject(properError)) {
    error.details.errorMessage = properError?.message;
    error.details.errorStack = properError?.stack;
    error.details.errorExtensions = properError?.extensions;
  } else {
    error.details.error = properError;
  }

  return error;
}

function isObject<T extends Record<string, any>>(value: unknown): value is T {
  return typeof value === "object" && value !== null;
}
