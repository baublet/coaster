import { CoasterError, isCoasterError } from "@baublet/coaster-utils";

import { NormalizedManifest } from "../../manifest/types";
import { createExpressServer } from "../../server/createExpressServer";
import { Server } from "../../server/types";

export async function initializeExpressServer(
  manifest: NormalizedManifest
): Promise<Server | CoasterError> {
  return await createExpressServer(manifest, {
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
        console.log(`Loaded endpoint: ${endpoint?.endpoint}`);
      }

      return endpoints;
    },
    afterServerStart: async ({ port }) => {
      console.log(`Server started on port ${port} 🚂`);
    },
  });
}
