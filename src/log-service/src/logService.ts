import { ServiceFactory } from "@baublet/service-container";

import { LogService } from "./types";
import { getConsoleLogService } from "./getConsoleLogService";

export const logService: ServiceFactory<LogService> = getConsoleLogService();
