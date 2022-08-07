import { Command as Program } from "commander";
import path from "path";

import { isCoasterError } from "@baublet/coaster-utils";

import { createExpressServer } from "../server/createExpressServer";
import { loadRawManifest } from "../manifest/loadRawManifest";
import { logCoasterError } from "./utils/logCoasterError";

export function serve(program: Program) {
  program
    .command("serve")
    .description(
      "Serve an application from your manifest via local Express.js server"
    )
    .argument(
      "[manifestFile]",
      "manifest file to serve. Defaults to ./manifest.ts"
    )
    .action(async (manifestFile = "./manifest.ts") => {
      const manifest = path.resolve(process.cwd(), manifestFile);
      const loadedManifest = await loadRawManifest(manifest);

      if (isCoasterError(loadedManifest)) {
        logCoasterError(loadedManifest);
        process.exit(1);
      }

      const server = await createExpressServer(loadedManifest, {
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

      if (isCoasterError(server)) {
        logCoasterError(server);
        process.exit(1);
      }

      console.log("Starting server");
      await server.start();
    });
}
