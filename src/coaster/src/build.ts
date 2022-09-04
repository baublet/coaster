/**
 * Runtime for the standalone Coaster Express server
 */

import { log } from "./server/log";
log.debug("Loading Coaster internals");

import path from "path";

import { isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "./manifest/loadRawManifest";
import { logCoasterError } from "./cli/utils/logCoasterError";
import { buildEndpoints } from "./cli/build/buildEndpoints";

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

  log.debug("Building endpoints");
  const result = await buildEndpoints(loadedManifest);

  if (isCoasterError(result)) {
    logCoasterError(result);
    process.exit(1);
  }
})()
  .then(() => {
    log.debug("Endpoints built");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
