import path from "path";

import { CoasterError, isCoasterError } from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { NormalizedManifest } from "../../manifest/types";
import { buildEndpoint } from "../../endpoints/buildEndpoint";
import { getBuildTools } from "../../build/getBuildTools";
import { logCoasterError } from "../utils/logCoasterError";
import { BuildTools } from "../../build/types";

export async function buildEndpoints(
  manifest: NormalizedManifest
): Promise<undefined | CoasterError[]> {
  const promises: Promise<void>[] = [];
  const errors: CoasterError[] = [];

  log.debug("Loading CLI tools");

  log.debug("Initializing CLI tools");

  const buildToolsToFlush = new Set<BuildTools>();

  log.debug("Loading endpoints");
  for (const endpoint of manifest.endpoints) {
    log.debug(`Loading endpoint ${endpoint.file}#${endpoint.exportName}`);
    promises.push(
      (async () => {
        const endpointFileFullPath = path.resolve(process.cwd(), endpoint.file);
        const buildTools = getBuildTools();

        try {
          const result = await buildEndpoint({
            fileDescriptor: {
              file: path.resolve(process.cwd(), endpoint.file),
              exportName: endpoint.exportName,
            },
            buildTools,
            endpointFileFullPath,
          });
          if (isCoasterError(result)) {
            logCoasterError(result);
            buildToolsToFlush.add(buildTools);
          }
        } catch (error) {
          buildToolsToFlush.add(buildTools);
          if (isCoasterError(error)) {
            logCoasterError(error);
          } else {
            log.error(error);
          }
        }
      })().catch((reason) => {
        log.error(reason);
      })
    );
  }

  const manifestUi = manifest.ui;
  if (manifestUi) {
    log.debug("Loading UI");
    const endpointFileFullPath = path.resolve(process.cwd(), manifestUi.file);
    const buildTools = getBuildTools();
    try {
      const result = await buildEndpoint({
        fileDescriptor: {
          file: path.resolve(process.cwd(), manifestUi.file),
          exportName: manifestUi.exportName,
        },
        buildTools,
        endpointFileFullPath,
      });
      if (isCoasterError(result)) {
        logCoasterError(result);
        buildToolsToFlush.add(buildTools);
      }
    } catch (error) {
      buildToolsToFlush.add(buildTools);
      if (isCoasterError(error)) {
        logCoasterError(error);
      } else {
        log.error(error);
      }
    }
  }

  log.debug("Waiting for builds to complete");
  await Promise.all(promises);
  log.debug("Build complete, flushing any errors and cleaning up");

  if (buildToolsToFlush.size > 0) {
    for (const buildTools of buildToolsToFlush) {
      buildTools.flushLogs();
    }
  }

  if (errors.length === 0) {
    return undefined;
  }

  return errors;
}
