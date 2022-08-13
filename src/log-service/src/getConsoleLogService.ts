import { ServiceFactory } from "@baublet/service-container";

import { LogService, LogProvider } from "./types";
import { getConsoleLogProvider } from "./getConsoleLogProvider";

export const getConsoleLogService: () => ServiceFactory<LogService> = () => {
  let provider: LogProvider = getConsoleLogProvider();
  return () => ({
    setProvider: (newProvider) => {
      provider = newProvider;
    },
    info: (...args: any[]) => provider.info(...args),
    debug: (...args: any[]) => provider.debug(...args),
    error: (...args: any[]) => provider.error(...args),
    warn: (...args: any[]) => provider.warn(...args),
  });
};
