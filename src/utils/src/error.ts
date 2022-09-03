export type CoasterError = {
  __isCoasterError: true;
  code: string;
  message: string;
  details?: ErrorDetails;
  time: number;
  stackTraces: string[];
};

export type ErrorDetails = Record<string, any>;
