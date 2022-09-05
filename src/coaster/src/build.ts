const startTime = Date.now();

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
  const loadedManifest = await loadRawManifest(manifestPath);

  if (isCoasterError(loadedManifest)) {
    logFailure(loadedManifest);
    process.exit(1);
  }

  const result = await buildEndpoints(loadedManifest);

  if (isCoasterError(result)) {
    logFailure(result);
    process.exit(1);
  }
})()
  .then(() => {
    console.log("Successful build took " + (Date.now() - startTime) + "ms");
    process.exit(0);
  })
  .catch((error) => {
    if (isCoasterError(error)) {
      logFailure(error);
    } else {
      console.error(error);
    }
    process.exit(1);
  });

function logFailure(error: CoasterError): void {
  logCoasterError(error, (error) => console.error(error));
  console.log(
    "Failed to build application after " + (Date.now() - startTime) + "ms"
  );
}
