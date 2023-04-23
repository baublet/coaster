import mkdirp from "mkdirp";

import { CoasterError, isCoasterError, perform } from "@baublet/coaster-utils";

import { ModuleMetadata } from "../manifest/types";
import { CreateReactUiOptions } from "./types";
import { BuildTools } from "../build/types";

export async function buildReactUi({
  metadata,
  buildFolder,
  uiOptions,
  buildTools,
}: {
  uiOptions: CreateReactUiOptions;
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

    const assetsPath = uiOptions.assetsPath || "assets";

    buildTools.log.info("Building application");
    const buildResult = await build({
      configFile: false,
      root: metadata.filePath,
      appType: "custom",
      base: assetsPath,
      clearScreen: false,
      customLogger: {
        ...buildTools.log,
        clearScreen: doNothing,
        hasErrorLogged: () => false,
        hasWarned: false,
        warnOnce: doNothing,
      },
      build: {
        assetsDir: assetsPath,
        emptyOutDir: true,
        outDir: buildFolder,
        sourcemap: true,
      },
    });
    buildTools.log.info("Application built");
    buildTools.setProgress(99, 100);
    return buildResult;
  });

  if (isCoasterError(buildResult)) {
    return buildResult;
  }
}

function doNothing() {}
