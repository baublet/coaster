import path from "path";

import { CoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../../manifest/types";
import { buildEndpoint } from "../../endpoints/buildEndpoint";
import { getBuildTools } from "../../build/getBuildTools";

export async function buildEndpoints(
  manifest: NormalizedManifest
): Promise<undefined | CoasterError[]> {
  const promises: Promise<undefined | CoasterError>[] = [];
  const errors: CoasterError[] = [];
  const buildTools = getBuildTools();

  for (const endpoint of manifest.endpoints) {
    const endpointFileFullPath = path.resolve(process.cwd(), endpoint.file);
    promises.push(
      buildEndpoint({
        fileDescriptor: {
          file: path.resolve(process.cwd(), endpoint.file),
          exportName: endpoint.exportName,
        },
        buildTools,
        endpointFileFullPath,
      })
    );
  }

  await Promise.all(promises);

  if (errors.length === 0) {
    return undefined;
  }

  return errors;
}
