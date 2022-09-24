import path from "path";

import { Command as Program } from "commander";
import { execa } from "execa";
import colors from "@colors/colors";

import { isCoasterError } from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { loadRawManifest } from "../../manifest/loadRawManifest";
import { logCoasterError } from "../utils/logCoasterError";

export function deploy(program: Program) {
  program
    .command("deploy")
    .description("Deploy your application")
    .argument(
      "[manifestFile]",
      "manifest file to serve. Defaults to ./manifest.ts"
    )
    .action(async (manifestFile = "./manifest.ts", options) => {
      const manifest = path.resolve(process.cwd(), manifestFile);
      const loadedManifest = await loadRawManifest(manifest);

      if (isCoasterError(loadedManifest)) {
        logCoasterError(loadedManifest);
        return process.exit(1);
      }

      const loadedManifestWithoutCoasterError = loadedManifest;

      // TODO: process any CLI arguments into coaster serve variables
      const additionalArguments: string[] = [];

      const coasterBuildPath = path.resolve(
        process.cwd(),
        "node_modules",
        ".bin",
        "coaster-build-application"
      );

      // Set a lock, so we don't restart before the first start is complete
      const watchingLocked = true;
      const lastWatcherEvent = 0;
      const bufferedChanges = 0;

      const childProcess = runCommand({
        coasterBuildPath,
        additionalArguments,
      });
    });
}

function runCommand({
  additionalArguments,
  coasterBuildPath,
}: {
  coasterBuildPath: string;
  additionalArguments: string[];
}) {
  log.info("\n⏳ " + colors.green("Building application"));
  log.info(colors.dim("   Watching for changes"));
  log.info(
    "   r, enter  " +
      colors.dim(". rebuild") +
      "\n" +
      "   q, ctrl-c " +
      colors.dim(". quit") +
      "\n"
  );

  return execa("node", [coasterBuildPath, ...additionalArguments], {
    all: true,
    cwd: process.cwd(),
    env: process.env,
    argv0: process.argv0,
    stdio: "inherit",
  });
}
