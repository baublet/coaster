import { ServiceContainer, ServiceFactory } from "@baublet/service-container";
import { LogLevel, LogService } from "@baublet/coaster-log-service";

export interface Context {
  services: ServiceContainer;
  log: (level: LogLevel, ...details: any[]) => void;
  setLogService: (logService: ServiceFactory<LogService>) => void;
  getLogService: () => ServiceFactory<LogService>;
}

/**
 * For core internals that need to be exposed to plugins and deep internals,
 * yet configurable by users, we need a known service map to let users store
 * and modify the services they wish us (and plugins) to use.
 */
export interface KnownServiceMap {
  log: LogService;
}
