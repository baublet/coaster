import { log, LogProvider } from "@baublet/coaster-log-service";

import { BuildTools } from "./types";

export function getBuildTools(
  { logProvider = log }: { logProvider?: LogProvider } = {
    logProvider: log,
  }
): BuildTools {
  let _current = 0;
  let _target = 0;
  let _onProgressChange: undefined | ((percent: number) => void) = undefined;
  const _isFlushing = false;

  const logs: string[] = [];

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
    log: {
      debug: (message: string) => {
        if (_isFlushing) {
          logProvider.debug(message);
        } else {
          logs.push(message);
        }
      },
      info: (message: string) => {
        if (_isFlushing) {
          logProvider.info(message);
        } else {
          logs.push(message);
        }
      },
      warn: (message: string) => {
        if (_isFlushing) {
          logProvider.warn(message);
        } else {
          logs.push(message);
        }
      },
      error: (message: string) => {
        if (_isFlushing) {
          logProvider.error(message);
        } else {
          logs.push(message);
        }
      },
    },
  };
}
