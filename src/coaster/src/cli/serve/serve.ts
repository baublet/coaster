import { ChildProcess } from "child_process";

import { Command as Program } from "commander";
import path from "path";
import { execa, KillOptions } from "execa";
import colors from "@colors/colors";

import { isCoasterError } from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";
import { getPathExecutable } from "@baublet/coaster-build-tools";

import { loadRawManifest } from "../../manifest/loadRawManifest";
import { logCoasterError } from "../utils/logCoasterError";

// Time before we start watching files
const WATCH_DELAY_MS = 1000;

const GLOBALLY_IGNORED_PATH_MATCHES = [
  `${path.sep}node_modules${path.sep}.vite`,
];

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

      const additionalEnvVars = {
        COASTER_WATCH: String(Boolean(options.watch)),
      };

      let childProcess = await runCommand(
        coasterServePath,
        additionalArguments,
        additionalEnvVars
      );
      async function restart() {
        watchingLocked = true;

        log.info("\n🔃 " + colors.green("Restarting server..."));
        log.info("🧹 " + colors.dim("Cleaning up old processes"));

        await childProcess.kill();
        childProcess = await runCommand(
          coasterServePath,
          additionalArguments,
          additionalEnvVars
        );

        setTimeout(() => {
          watchingLocked = false;
        }, WATCH_DELAY_MS);
      }

      process.stdin.setRawMode(true);
      process.stdin.setEncoding("utf8");

      const maybeWatcher = await (async () => {
        if (!options.watch) {
          return;
        }

        const { watch } = await import("chokidar");
        const watcher = watch(process.cwd()).on("all", (event, path) => {
          if (isIgnored({ path, event })) {
            log.debug(
              colors.dim(
                `Ignoring file change [${event}]: ${path.replace(
                  process.cwd(),
                  ""
                )}`
              )
            );
            return;
          }
          if (lastWatcherEvent === 0 && !watchingLocked) {
            log.info("\n📦 " + colors.blue("Change detected..."));
          }
          if (!watchingLocked) {
            if (bufferedChanges < 5) {
              log.info(colors.dim(`[${event}] ${path}`));
            } else if (bufferedChanges === 5) {
              log.info(colors.dim("..."));
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
          log.info("\n🧼 " + colors.dim("Cleaning up processes"));

          await childProcess.kill("SIGTERM", {
            forceKillAfterTimeout: 3000,
          });

          if (maybeWatcher) {
            log.info("🚿 " + colors.dim("Cleaning up watchers"));
            await maybeWatcher.close();
          }

          log.info("");

          process.exit(0);
        }
      });
    });
}

async function runCommand(
  coasterServePath: string,
  additionalArguments: string[],
  envVars: Record<string, string> = {}
): Promise<
  Omit<ChildProcess, "kill"> & {
    kill: (signal?: string, options?: KillOptions) => void;
  }
> {
  log.info("\n⏳ " + colors.green("Starting server..."));
  log.info(
    "   r, enter  " +
      colors.dim(". restart server") +
      "\n" +
      "   q, ctrl-c " +
      colors.dim(". quit server") +
      "\n"
  );

  const executable = await getPathExecutable(coasterServePath);

  return execa(executable, [coasterServePath, ...additionalArguments], {
    all: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...envVars,
    },
    argv0: process.argv0,
    stdio: "inherit",
  });
}

function isIgnored({ path }: { path: string; event: string }) {
  for (let i = 0; i < GLOBALLY_IGNORED_PATH_MATCHES.length; i++) {
    if (path.includes(GLOBALLY_IGNORED_PATH_MATCHES[i])) {
      return true;
    }
  }
  return false;
}
