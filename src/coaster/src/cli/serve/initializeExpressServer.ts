import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../../manifest/types";
import { createExpressServer } from "../../server/createExpressServer";
import { Server } from "../../server/types";
import { log } from "../../server/log";

export function initializeExpressServer(
  manifest: NormalizedManifest
): Promise<Server | CoasterError> {
  return createExpressServer(
    {
      manifest,
      manifestFullPath: manifest.__coasterManifestFullPath,
    },
    {
      afterEndpointsLoaded: async (endpoints) => {
        // Loop through them twice: once to see if we should exit,
        // then exit if there are errors. If there are no errors,
        // tell the user which endpoints are loaded.
        if (endpoints.some((error) => isCoasterError(error))) {
          return endpoints;
        }
        for (const endpoint of endpoints) {
          if (isCoasterError(endpoint)) {
            // NOOP: here for type safety
            continue;
          }
          log.debug(`Loaded endpoint: ${endpoint?.endpoint}`);
        }

        return endpoints;
      },
      afterServerStart: async ({ port }) => {
        log.info(`Server started on port ${port} 🚂`);
      },
    }
  );
}
