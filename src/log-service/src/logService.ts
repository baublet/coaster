import { ServiceFactory } from "@baublet/service-container";

import { LogService } from "./types";
import { getConsoleLogService } from "./getConsoleLogService";

export let logService: ServiceFactory<LogService> = getConsoleLogService();

export function setLogService(service: LogService): void {
  logService = () => service;
}
