export type CoasterError = {
  __isCoasterError: true;
  code: string;
  message: string;
  details?: ErrorDetails;
  time: number;
};

export type ErrorDetails = Record<string, any>;
