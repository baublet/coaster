import { LogProvider } from "./types";

export function getConsoleLogProvider(): LogProvider {
  return {
    debug: (message?: any, ...optionalParams: any[]) =>
      console.debug(message, ...optionalParams),
    error: (message?: any, ...optionalParams: any[]) =>
      console.error(message, ...optionalParams),
    warn: (message?: any, ...optionalParams: any[]) =>
      console.warn(message, ...optionalParams),
    log: (message?: any, ...optionalParams: any[]) =>
      console.log(message, ...optionalParams),
  };
}
