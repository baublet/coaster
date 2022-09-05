import path from "path";

import { Command as Program } from "commander";
import { execa } from "execa";
import colors from "@colors/colors";
import { watch } from "chokidar";

import { isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "../../manifest/loadRawManifest";
import { logCoasterError } from "../utils/logCoasterError";
import { shouldRebuild } from "../../build/watchFilesForEndpointDescriptor";

// Time before we start watching files
const WATCH_DELAY_MS = 1000;

export function build(program: Program) {
  program
    .command("build")
    .description("Build your application")
    .option("-w, --watch", "Rebuild the application when files change")
    .option(
      "--watchDebounce <milliseconds>",
      "Time to collect additional file changes before restarting",
      parseInt
    )
    .argument(
      "[manifestFile]",
      "manifest file to serve. Defaults to ./manifest.ts"
    )
    .action(async (manifestFile = "./manifest.ts", options) => {
      const manifest = path.resolve(process.cwd(), manifestFile);
      const loadedManifest = await loadRawManifest(manifest);
      const watchModeEnabled = options.watch === true;

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
      let watchingLocked = true;
      let lastWatcherEvent = 0;
      let bufferedChanges = 0;

      let childProcess = runCommand({
        coasterBuildPath,
        additionalArguments,
        watch: watchModeEnabled,
      });

      if (watchModeEnabled) {
        // Required for ensuring our stdin from this process is piped through to
        // the child process.
        process.stdin.setEncoding("utf8");
        process.stdin.setRawMode(true);

        const restart = async () => {
          watchingLocked = true;

          console.log("\n🔃 " + colors.green("Rebuilding application..."));
          console.log("🧹 " + colors.dim("Cleaning up old processes"));

          await childProcess.kill();

          setTimeout(() => {
            watchingLocked = false;
          }, WATCH_DELAY_MS);

          childProcess = runCommand({
            coasterBuildPath,
            additionalArguments,
            watch: watchModeEnabled,
          });
        };

        const maybeWatcher = (() => {
          if (!options.watch) {
            return;
          }

          const watcher = watch(process.cwd()).on(
            "all",
            async (event, path) => {
              const shouldRebuildNow = await shouldRebuild(
                loadedManifestWithoutCoasterError,
                path
              );
              if (!shouldRebuildNow) {
                return false;
              }

              if (lastWatcherEvent === 0 && !watchingLocked) {
                console.log("\n📦 " + colors.blue("Change detected..."));
              }
              if (!watchingLocked) {
                if (bufferedChanges < 5) {
                  console.log(colors.dim(`[${event}] ${path}`));
                } else if (bufferedChanges === 5) {
                  console.log(colors.dim("..."));
                }
              }
              if (!watchingLocked) {
                bufferedChanges++;
                lastWatcherEvent = Date.now();
              }
            }
          );

          const optionInterval = options.watchDebounce || 500;
          setInterval(() => {
            if (
              lastWatcherEvent !== 0 &&
              Date.now() - lastWatcherEvent > optionInterval
            ) {
              restart();
              lastWatcherEvent = 0;
              bufferedChanges = 0;
            }
          }, optionInterval);

          setTimeout(() => {
            watchingLocked = false;
          }, WATCH_DELAY_MS);

          return watcher;
        })();

        process.stdin.on("data", async (data: any) => {
          if (data === "r" || data === "R" || data === "\r") {
            await childProcess?.kill?.();
            return await restart();
          }

          if (data === "q" || data === "Q" || data === "\u0003") {
            console.log("\n🧼 " + colors.dim("Cleaning up processes"));

            await childProcess?.kill?.("SIGTERM", {
              forceKillAfterTimeout: 3000,
            });

            if (maybeWatcher) {
              console.log("🚿 " + colors.dim("Cleaning up watchers"));
              await maybeWatcher.close();
            }

            process.exit(0);
          }
        });
      }
    });
}

function runCommand({
  additionalArguments,
  coasterBuildPath,
  watch,
}: {
  watch: boolean;
  coasterBuildPath: string;
  additionalArguments: string[];
}) {
  if (watch) {
    console.log("\n⏳ " + colors.green("Building application"));
    console.log(colors.dim("   Watching for changes"));
    console.log(
      "   r, enter  " +
        colors.dim(". rebuild") +
        "\n" +
        "   q, ctrl-c " +
        colors.dim(". quit") +
        "\n"
    );
  }

  return execa("node", [coasterBuildPath, ...additionalArguments], {
    all: true,
    cwd: process.cwd(),
    env: process.env,
    argv0: process.argv0,
    stdio: "inherit",
  });
}
