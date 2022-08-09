export type CoasterError = {
  __isCoasterError: true;
  code: string;
  message: string;
  details?: ErrorDetails;
};

export type ErrorDetails = Record<
  string,
  string | number | boolean | undefined | null
>;
