import { LogProvider } from "@baublet/coaster-log-service";

export interface BuildTools {
  setProgress: (current: number, target: number) => void;
  getProgress: () => { currentProgress: number; targetProgress: number };
  log: LogProvider;
}