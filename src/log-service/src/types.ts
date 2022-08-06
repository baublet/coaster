export interface LogService extends LogProvider {
  setProvider: (provider: LogProvider) => void;
}

export interface LogProvider {
  debug: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

export const LOG_LEVELS = ["debug", "log", "warn", "error"] as const;
export type LogLevel = typeof LOG_LEVELS;
