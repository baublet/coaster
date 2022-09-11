import path from "path";

import { CoasterError, isCoasterError } from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";
import type { SingleBar } from "cli-progress";

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

  const { MultiBar, Presets } = await import("cli-progress");
  const colors = await import("@colors/colors");

  log.debug("Initializing CLI tools");

  const multibar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      autopadding: true,
      stopOnComplete: true,
      barGlue: "",
      format: `${colors.green(
        "{bar}"
      )} | {percentage}% | {duration_formatted} | ${colors.dim("{endpoint}")}`,
    },
    Presets.shades_classic
  );

  const buildToolsToFlush = new Set<BuildTools>();

  log.debug("Loading endpoints");
  for (const endpoint of manifest.endpoints) {
    log.debug(`Loading endpoint ${endpoint.file}#${endpoint.exportName}`);
    promises.push(
      (async () => {
        let progressBar: SingleBar | Record<string, any> = {};
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
            onHasBuild: () => {
              progressBar = multibar.create(100, 1, {
                endpoint: endpoint.file.replace(process.cwd() + path.sep, ""),
              });
              progressBar?.render();
              buildTools.onProgressChange((percent) => {
                progressBar?.update?.(percent);
                progressBar?.render();
              });
            },
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
        } finally {
          progressBar?.update?.(100);
          progressBar?.stop?.();
        }
      })().catch((reason) => {
        log.error(reason);
      })
    );
  }

  log.debug(`Waiting for builds to complete`);
  await Promise.all(promises);
  multibar.stop();
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
