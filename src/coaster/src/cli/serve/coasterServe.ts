import path from "path";

import { isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "../../manifest/loadRawManifest";
import { logCoasterError } from "../utils/logCoasterError";
import { initializeExpressServer } from "./initializeExpressServer";

const MANIFEST_FULL_PATH = process.env.MANIFEST_FULL_PATH || "./manifest.ts";

(async () => {
  const manifestPath = path.resolve(process.cwd(), MANIFEST_FULL_PATH);
  const loadedManifest = await loadRawManifest(manifestPath);

  if (isCoasterError(loadedManifest)) {
    logCoasterError(loadedManifest);
    process.exit(1);
  }

  const server = await initializeExpressServer(loadedManifest);

  if (isCoasterError(server)) {
    logCoasterError(server);
    process.exit(1);
  }

  console.log("Starting server");
  await server.start();
})();
