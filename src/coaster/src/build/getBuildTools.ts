import { log, LogProvider, LogLevel } from "@baublet/coaster-log-service";

import { BuildTools } from "./types";

export function getBuildTools(
  { logProvider = log }: { logProvider?: LogProvider } = {
    logProvider: log,
  }
): BuildTools {
  let _current = 0;
  let _target = 0;
  let _onProgressChange: undefined | ((percent: number) => void) = undefined;
  let _isFlushing = false;

  const logs: { message: string; level: LogLevel }[] = [];

  return {
    onProgressChange: (callback) => {
      _onProgressChange = callback;
    },
    setProgress: (current: number, target: number) => {
      if (current !== _current || target !== _target) {
        _current = current;
        _target = target;
        const newPercent = Math.floor(
          (Number(_current) / Number(_target)) * 100
        );
        _onProgressChange?.(newPercent);
      }
    },
    getProgress: () => ({ currentProgress: _current, targetProgress: _target }),
    flushLogs: () => {
      _isFlushing = true;
      logs.forEach(({ message, level }) => {
        logProvider[level](message);
      });
    },
    log: {
      debug: (message: string) => {
        if (_isFlushing) {
          logProvider.debug(message);
        } else {
          logs.push({ message, level: "debug" });
        }
      },
      info: (message: string) => {
        if (_isFlushing) {
          logProvider.info(message);
        } else {
          logs.push({ message, level: "info" });
        }
      },
      warn: (message: string) => {
        if (_isFlushing) {
          logProvider.warn(message);
        } else {
          logs.push({ message, level: "warn" });
        }
      },
      error: (message: string) => {
        if (_isFlushing) {
          logProvider.error(message);
        } else {
          logs.push({ message, level: "error" });
        }
      },
    },
  };
}
