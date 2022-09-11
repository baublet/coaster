import { LogProvider } from "@baublet/coaster-log-service";

export interface BuildTools {
  setProgress: (current: number, target: number) => void;
  getProgress: () => { currentProgress: number; targetProgress: number };
  onProgressChange: (callback: (percent: number) => void) => void;
  log: LogProvider;
  flushLogs: () => void;
}
