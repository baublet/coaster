import path from "path";

import { MultiBar, Presets, SingleBar } from "cli-progress";
import colors from "@colors/colors";

import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../../manifest/types";
import { buildEndpoint } from "../../endpoints/buildEndpoint";
import { getBuildTools } from "../../build/getBuildTools";
import { logCoasterError } from "../utils/logCoasterError";

export async function buildEndpoints(
  manifest: NormalizedManifest
): Promise<undefined | CoasterError[]> {
  const promises: Promise<void>[] = [];
  const errors: CoasterError[] = [];

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

  for (const endpoint of manifest.endpoints) {
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
              progressBar = multibar.create(100, 0, {
                endpoint: endpoint.file.replace(process.cwd() + path.sep, ""),
              });
              buildTools.onProgressChange((percent) => {
                progressBar?.update(percent);
              });
            },
          });
          if (isCoasterError(result)) {
            logCoasterError(result);
          }
        } catch (error) {
          if (isCoasterError(error)) {
            logCoasterError(error);
          } else {
            console.error(error);
          }
        } finally {
          progressBar?.update(100);
          progressBar?.stop();
        }
      })()
    );
  }

  await Promise.all(promises);

  multibar.stop();

  if (errors.length === 0) {
    return undefined;
  }

  return errors;
}
