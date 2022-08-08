import { ChildProcess } from "child_process";

import { Command as Program } from "commander";
import path from "path";
import { execa, KillOptions } from "execa";
import colors from "@colors/colors";
import { watch } from "chokidar";

import { isCoasterError } from "@baublet/coaster-utils";

import { loadRawManifest } from "../../manifest/loadRawManifest";
import { logCoasterError } from "../utils/logCoasterError";

// Time before we start watching files
const WATCH_DELAY_MS = 1000;

export function serve(program: Program) {
  program
    .command("serve")
    .description(
      "Serve an application from your manifest via local Express.js server"
    )
    .option("-w, --watch", "Restart the application when files change")
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

      if (isCoasterError(loadedManifest)) {
        logCoasterError(loadedManifest);
        process.exit(1);
      }

      // TODO: process any CLI arguments into coaster serve variables
      const additionalArguments: string[] = [];

      const coasterServePath = path.resolve(
        process.cwd(),
        "node_modules",
        ".bin",
        "coaster-serve"
      );

      // Set a lock, so we don't restart before the first start is complete
      let watchingLocked = true;
      let lastWatcherEvent = 0;
      let bufferedChanges = 0;

      let childProcess = runCommand(coasterServePath, additionalArguments);
      async function restart() {
        watchingLocked = true;

        console.log("\n🔃 " + colors.green("Restarting server..."));
        console.log("🧹 " + colors.dim("Cleaning up old processes"));

        await childProcess.kill();
        childProcess = runCommand(coasterServePath, additionalArguments);

        setTimeout(() => {
          watchingLocked = false;
        }, WATCH_DELAY_MS);
      }

      process.stdin.setRawMode(true);
      process.stdin.setEncoding("utf8");

      const maybeWatcher = (() => {
        if (!options.watch) {
          return;
        }

        const watcher = watch(process.cwd()).on("all", (event, path) => {
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
        });

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
          await childProcess.kill();
          return await restart();
        }

        if (data === "q" || data === "Q" || data === "\u0003") {
          console.log("\n🧼 " + colors.dim("Cleaning up processes"));

          await childProcess.kill("SIGTERM", {
            forceKillAfterTimeout: 3000,
          });

          if (maybeWatcher) {
            console.log("🚿 " + colors.dim("Cleaning up watchers"));
            await maybeWatcher.close();
          }

          console.log("");

          process.exit(0);
        }
      });
    });
}

function runCommand(
  coasterServePath: string,
  additionalArguments: string[]
): Omit<ChildProcess, "kill"> & {
  kill: (signal?: string, options?: KillOptions) => void;
} {
  console.log("\n⏳ " + colors.green("Starting server..."));
  console.log(
    "   r, enter  " +
      colors.dim(". restart server") +
      "\n" +
      "   q, ctrl-c " +
      colors.dim(". quit server") +
      "\n"
  );

  return execa("node", [coasterServePath, ...additionalArguments], {
    all: true,
    cwd: process.cwd(),
    env: process.env,
    argv0: process.argv0,
    stdio: "inherit",
  });
}
