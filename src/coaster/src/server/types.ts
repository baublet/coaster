import type { Express } from "express";

import { CoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../manifest/types";

export interface Server {
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export interface ServerDriver {
  initialize: (
    manifest: NormalizedManifest
  ) => Promise<undefined | CoasterError>;
  attach: (app: Express) => Promise<undefined | CoasterError>;
}
