import { LogService } from "@baublet/coaster-log-service";
import { ServiceContainer } from "@baublet/service-container";

import { Context } from "./base";

export function getContextLogProperties(
  serviceContainer: ServiceContainer
): Pick<Context, "log" | "setLogService" | "getLogService"> {
  let logService: LogService = () => console;

  return {
    setLogService: (newLogService) => {
      logService = newLogService;
    },
    getLogService: () => logService,
    log: (level, ...details) => {
      const provider = serviceContainer.get(logService);
      provider[level](...details);
    },
  };
}
