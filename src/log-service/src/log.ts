import { LogProvider } from "./types";
import { getConsoleLogProvider } from "./getConsoleLogProvider";

let provider: LogProvider = getConsoleLogProvider();

export const log = {
  setProvider: (newProvider: LogProvider) => {
    provider = newProvider;
  },
  info: (...args: any[]) => provider.info(...args),
  debug: (...args: any[]) => provider.debug(...args),
  error: (...args: any[]) => provider.error(...args),
  warn: (...args: any[]) => provider.warn(...args),
};
