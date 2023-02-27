import { ModuleMetadata } from "../manifest/types";

import { CoasterTrack } from "../track/types";
import { getExpressMiddleware } from "../endpoints/getExpressMiddleware";
import { CreateReactTrackOptions } from "./types";

export function createDevelopmentReactTrack(
  trackOptions: CreateReactTrackOptions
): (args: ModuleMetadata) => Promise<CoasterTrack> {
  return async (metadata) => {
    const viteModule = await import("vite");
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: false,
      root: metadata.fileBaseName,
    });

    return {
      __isCoasterTrack: true,
      build: () => {
        // Vite handles this
      },
      buildWatchPatterns: [],
      handler: getExpressMiddleware(vite.middlewares),
      endpoint: trackOptions.endpoint,
      method: "ALL",
      middleware: trackOptions.middleware,
    };
  };
}
