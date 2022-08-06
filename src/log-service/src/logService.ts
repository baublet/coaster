import { ServiceFactory } from "@baublet/service-container";

import { LogService, LogProvider } from "./types";

export const logService: ServiceFactory<LogService> = () => {
  let provider: LogProvider = console;

  return {
    setProvider: (newProvider) => {
      provider = newProvider;
    },
    log: (...args: any[]) => provider.log(...args),
    debug: (...args: any[]) => provider.debug(...args),
    error: (...args: any[]) => provider.error(...args),
    warn: (...args: any[]) => provider.warn(...args),
  };
};
