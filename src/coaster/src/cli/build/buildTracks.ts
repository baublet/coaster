import path from "path";

import { CoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../../manifest/types";
import { buildTrack } from "../../track/buildTrack";
import { getBuildTools } from "../../build/getBuildTools";

export async function buildTracks(
  manifest: NormalizedManifest
): Promise<undefined | CoasterError[]> {
  const promises: Promise<undefined | CoasterError>[] = [];
  const errors: CoasterError[] = [];
  const buildTools = getBuildTools();

  for (const endpoint of manifest.endpoints) {
    promises.push(
      buildTrack({
        fileDescriptor: {
          file: path.resolve(process.cwd(), endpoint.file),
          exportName: endpoint.exportName,
        },
        buildTools,
      })
    );
  }

  await Promise.all(promises);

  if (errors.length === 0) {
    return undefined;
  }

  return errors;
}
