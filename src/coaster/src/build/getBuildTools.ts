import {
  LogProvider,
  getConsoleLogProvider,
} from "@baublet/coaster-log-service";

import { BuildTools } from "./types";

export function getBuildTools(
  { logProvider = getConsoleLogProvider() }: { logProvider?: LogProvider } = {
    logProvider: getConsoleLogProvider(),
  }
): BuildTools {
  let _current = 0;
  let _target = 0;
  return {
    setProgress: (current: number, target: number) => {
      _current = current;
      _target = target;
    },
    getProgress: () => ({ currentProgress: _current, targetProgress: _target }),
    log: logProvider,
  };
}
