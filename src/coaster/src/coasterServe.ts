/**
 * Runtime for the standalone Coaster Express server
 */

import { log } from "@baublet/coaster-log-service";
log.debug("Loading Coaster internals");

import path from "path";

import { isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "./manifest/loadRawManifest";
import { logCoasterError } from "./cli/utils/logCoasterError";
import { initializeExpressServer } from "./cli/serve/initializeExpressServer";

log.debug("Internals loaded");

const MANIFEST_FULL_PATH = process.env.MANIFEST_FULL_PATH || "./manifest.ts";

(async () => {
  log.debug("Loading manifest");
  const manifestPath = path.resolve(process.cwd(), MANIFEST_FULL_PATH);
  const loadedManifest = await loadRawManifest(manifestPath);

  if (isCoasterError(loadedManifest)) {
    logCoasterError(loadedManifest);
    process.exit(1);
  }

  log.debug("Initializing Express server");
  const server = await initializeExpressServer(loadedManifest);
  log.debug("Express loaded");

  if (isCoasterError(server)) {
    logCoasterError(server);
    process.exit(1);
  }

  log.debug("Starting server");
  await server.start();
})();
