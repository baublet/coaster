import path from "path";

import { readFile } from "@baublet/coaster-fs";
import { isCoasterError } from "@baublet/coaster-utils";

import { ModuleMetadata } from "../manifest/types";
import { InternalEndpoint } from "../endpoints/types";
import { CoasterTrack } from "../track/types";
import { CreateReactUiOptions } from "./types";

export function createDevelopmentReactUi(
  uiOptions: CreateReactUiOptions = {}
): (args: ModuleMetadata) => Promise<
  CoasterTrack & {
    dangerouslyApplyMiddleware?: InternalEndpoint["dangerouslyApplyMiddleware"];
  }
> {
  return async (metadata) => {
    const normalizedEndpoint = uiOptions.endpoint || "*";

    const viteModule = await import("vite");
    const reactPlugin = await import("@vitejs/plugin-react");

    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      configFile: false,
      root: metadata.filePath,
      appType: "custom",
      base: uiOptions.assetsPath || "/assets",
      clearScreen: false,
      plugins: [
        reactPlugin.default({
          include: "**/*.tsx",
        }),
      ],
    });

    const rootHtmlFile = path.resolve(metadata.filePath, "index.html");
    const rootHtmlContents = await readFile(rootHtmlFile);

    return {
      __isCoasterTrack: true,
      build: () => {
        // Vite handles this
      },
      buildWatchPatterns: [],
      dangerouslyApplyMiddleware: (app) => {
        if (normalizedEndpoint === "*") {
          app.use(vite.middlewares);
        } else {
          app.use(normalizedEndpoint, vite.middlewares);
        }
      },
      handler: async (context) => {
        const request = context.request;
        const response = context.response;

        if (!response.writable || response.headersSent) {
          return;
        }

        if (isCoasterError(rootHtmlContents)) {
          context.log(
            "error",
            "Error reading root HTML file!",
            rootHtmlContents
          );
          if (!response.headersSent) {
            response.writeHead(500);
            response.end();
          }
          return;
        }

        const rootHtmlTemplate = await vite.transformIndexHtml(
          request.originalUrl,
          rootHtmlContents
        );
        response
          .status(200)
          .set({ "Content-Type": "text/html" })
          .end(rootHtmlTemplate);
      },
      endpoint: normalizedEndpoint,
      method: "ALL",
      middleware: uiOptions.middleware,
    };
  };
}
