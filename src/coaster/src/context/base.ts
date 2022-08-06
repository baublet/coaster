import { ServiceContainer } from "@baublet/service-container";
import { LogLevel, LogService } from "@baublet/coaster-log-service";

export interface Context {
  services: ServiceContainer;
  log: (level: LogLevel, ...details: any[]) => void;
  setLogService: (logService: LogService) => void;
  getLogService: () => LogService;
}
