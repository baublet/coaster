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

  const newStackTraces = error ? [error.stack] : [];
  newStackTraces.push(new Error().stack);

  return {
    __isCoasterError: true,
    code,
    message,
    details: newDetails,
    time: Date.now(),
    stackTraces: newStackTraces,
  };
}

export function addDetailsToCoasterError(
  error: CoasterError,
  details: ErrorDetails
): CoasterError {
  return {
    ...error,
    details: {
      ...error.details,
      ...details,
    },
  };
}

export function combineCoasterErrors(
  ...errorsInput: CoasterError[]
): CoasterError {
  if (errorsInput.length === 0) {
    return createCoasterError({
      code: "combineCoasterErrors-no-errors",
      message: "No errors were provided to combineCoasterErrors",
      details: { stack: new Error().stack },
    });
  }

  if (errorsInput.length < 2) {
    return errorsInput[0];
  }

  const errors = errorsInput.slice(0, -1);
  const lastError = errorsInput[errorsInput.length - 1];
  return errors.reduce((acc, error) => {
    if (!acc.details) {
      acc.details = {};
    }
    if (!acc.details.__coasterErrorParents) {
      acc.details.__coasterErrorParents = [];
    }
    acc.details.__coasterErrorParents.push(error);
    return acc;
  }, lastError);
}
