import type { Express } from "express";

export interface ExpressServer {
  getExpressInstance(): Express;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}
