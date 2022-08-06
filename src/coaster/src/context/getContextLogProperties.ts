import { LogService } from "@baublet/coaster-log-service";
import { ServiceContainer } from "@baublet/service-container";

import { Context } from "./base";

/**
 * Logging is core functionality that needs to be shared by any plugins
 * and other things outside of userspace, yet necessarily configurable by
 * developers. We thus have to expose the logging service from the context
 * for ease of access.
 */
export function getContextLogProperties(
  serviceContainer: ServiceContainer
): Pick<Context, "log" | "setLogService" | "getLogService"> {
  let logService: ServiceContainer<LogService> = () => console;

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
