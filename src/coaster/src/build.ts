import { performance } from "perf_hooks";
import { log } from "@baublet/coaster-log-service";

log.debug("Gathering build artifacts and loading modules");
const startTime = performance.now();

/**
 * Runtime for the standalone Coaster Express build script
 */
import path from "path";

import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "./manifest/loadRawManifest";
import { logCoasterError } from "./cli/utils/logCoasterError";
import { buildEndpoints } from "./cli/build/buildEndpoints";

const MANIFEST_FULL_PATH = process.env.MANIFEST_FULL_PATH || "./manifest.ts";

(async () => {
  const manifestPath = path.resolve(process.cwd(), MANIFEST_FULL_PATH);
  log.debug("Loading manifest");
  const loadedManifest = await loadRawManifest(manifestPath);

  if (isCoasterError(loadedManifest)) {
    logFailure(loadedManifest);
    process.exit(1);
  }

  log.debug("Building endpoints");
  const result = await buildEndpoints(loadedManifest);

  if (isCoasterError(result)) {
    logFailure(result);
    process.exit(1);
  }
})()
  .then(() => {
    const endTime = performance.now();
    const elapsedMs = endTime - startTime;
    const roundedElapsedTime =
      Math.round((elapsedMs + Number.EPSILON) * 100) / 100;
    log.info(`Successful build took ${roundedElapsedTime}ms`);
    process.exit(0);
  })
  .catch((error) => {
    if (isCoasterError(error)) {
      logFailure(error);
    } else {
      log.error(error);
    }
    process.exit(1);
  });

function logFailure(error: CoasterError): void {
  logCoasterError(error);
  log.error(
    "Failed to build application after " + (Date.now() - startTime) + "ms"
  );
}
