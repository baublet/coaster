import { Command as Program } from "commander";
import path from "path";

import { createServer } from "../server/createServer";
import { loadRawManifest } from "../manifest/loadRawManifest";
import { isCoasterError } from "@baublet/coaster-utils";
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

      console.log("Loading manifest file:", manifest);
      const loadedManifest = await loadRawManifest(manifest);

      if (isCoasterError(loadedManifest)) {
        logCoasterError(loadedManifest);
        process.exit(1);
      }

      console.log("Loading server");
      const server = await createServer(loadedManifest);

      if (isCoasterError(server)) {
        logCoasterError(server);
        process.exit(1);
      }

      console.log("Starting server");
      await server.start();
    });
}
