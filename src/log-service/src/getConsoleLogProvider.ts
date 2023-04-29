import { formatLog } from "./formatLog";
import { LogProvider } from "./types";

export function getConsoleLogProvider(): LogProvider {
  return {
    debug: (...args: any[]) => {
      if (process.env.DEBUG !== "true") {
        return;
      }
      console.debug(formatLog(...args));
    },
    error: (...args: any[]) => console.error(formatLog(...args)),
    warn: (...args: any[]) => console.warn(formatLog(...args)),
    info: (...args: any[]) => console.log(formatLog(...args)),
  };
}
