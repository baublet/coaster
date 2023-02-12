import { createServer as createViteServer } from "vite";

import { ModuleMetaData } from "@baublet/coaster";

import { CoasterTrack } from "../track/types";
import { EndpointInput } from "../endpoints/types";
import { getExpressMiddleware } from "../endpoints/getExpressMiddleware";

export function createReactTrack({
  endpoint = "*",
}: EndpointInput & {
  staticAssetsPublicUrl?: string;
  cssPublicPath?: string;
  jsPublicPath?: string;
  rootComponent?: string;
}): (args: ModuleMetaData) => Promise<CoasterTrack> {
  return async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: false,
      // root
    });

    return {
      __isCoasterTrack: true,
      build: () => {
        console.log("Not done yet");
      },
      buildWatchPatterns: [],
      handler: () => ({}),
      endpoint,
      method: "all",
      middleware: [getExpressMiddleware(vite.middlewares)],
    };
  };
}
