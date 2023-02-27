import mkdirp from "mkdirp";

import { CoasterError, isCoasterError, perform } from "@baublet/coaster-utils";

import { ModuleMetadata } from "../manifest/types";
import { CreateReactTrackOptions } from "./types";
import { BuildTools } from "../build/types";

export async function buildReactTrack({
  metadata,
  buildFolder,
  trackOptions,
  buildTools,
}: {
  trackOptions: CreateReactTrackOptions;
  metadata: ModuleMetadata;
  buildFolder: string;
  buildTools: BuildTools;
}): Promise<CoasterError | undefined> {
  buildTools.setProgress(0, 100);
  buildTools.log.info(`Creating build folder ${buildFolder}`);
  const mkdirpResult = await perform(() => mkdirp(buildFolder));
  if (isCoasterError(mkdirpResult)) {
    return mkdirpResult;
  }
  buildTools.setProgress(5, 100);

  const buildResult = await perform(async () => {
    buildTools.log.info("Importing build tools");
    const { build } = await import("vite");
    buildTools.setProgress(15, 100);

    buildTools.log.info("Building application");
    const buildResult = await build({
      configFile: false,
      root: metadata.filePath,
      appType: "custom",
      base: "/",
      clearScreen: false,
      customLogger: {
        ...buildTools.log,
        clearScreen: function doNothing() {},
        hasErrorLogged: () => false,
        hasWarned: false,
        warnOnce: buildTools.log.warn,
      },
      build: {
        assetsDir: trackOptions.assetsDir,
        emptyOutDir: true,
        outDir: buildFolder,
        sourcemap: true,
      },
    });
    buildTools.log.info("Application built");
    buildTools.setProgress(95, 100);
    return buildResult;
  });

  if (isCoasterError(buildResult)) {
    return buildResult;
  }
}
