export type CoasterError = {
  __isCoasterError: true;
  code: string;
  message: string;
  details?: ErrorDetails;
  error?: {
    message: string;
    stack?: string;
  };
};

export type ErrorDetails = Record<string, string | number | boolean>;
