import path from "path";
import hashObject from "object-hash";

import type { ModuleMetadata } from "@baublet/coaster";
import { readFile } from "@baublet/coaster-fs";
import {
  getErrorLikeStringFromUnknown,
  isCoasterError,
} from "@baublet/coaster-utils";

import type { CoasterTrack } from "../track/types";
import type { CreateReactTrackOptions } from "./types";
import { getFailedTrack } from "../track/getFailedTrack";

export function createReactTrack(
  trackOptions: CreateReactTrackOptions
): (args: ModuleMetadata) => Promise<CoasterTrack> {
  return async function coasterReactTrackLoader(metadata) {
    const assetFolderPath = trackOptions.assetsDir || "assets";
    const assetsPublicPath = `${trackOptions.endpoint.replace(
      "*",
      ""
    )}/${assetFolderPath}/`;
    const buildFolder =
      trackOptions.buildDir ||
      path.resolve(
        process.cwd(),
        "node_modules",
        ".coaster",
        hashObject({ trackOptions, metadata })
      );
    const rootHtmlFile = path.resolve(buildFolder, "index.html");
    const rootHtmlContents = await readFile(rootHtmlFile);

    if (isCoasterError(rootHtmlContents)) {
      return getFailedTrack({
        endpoint: trackOptions.endpoint,
        error: rootHtmlContents,
      });
    }

    return {
      __isCoasterTrack: true,
      build: async (buildTools) => {
        const { buildReactTrack } = await import("./buildReactTract");
        return buildReactTrack({
          metadata,
          trackOptions,
          buildFolder,
          buildTools,
        });
      },
      buildWatchPatterns: [],
      handler: (context) => {
        const request = context.request;
        const response = context.response;

        const url = request.url || "";
        if (url.includes(assetsPublicPath)) {
          const requestedPath = getRequestedPath({ url, buildFolder });
          if (isOkToServePath({ requestedPath, buildFolder })) {
            response.sendFile(
              path.basename(requestedPath),
              {
                maxAge: 0,
                root: path.dirname(requestedPath),
                dotfiles: "ignore",
              },
              (error) => {
                if (!error) {
                  return;
                }
                context.log(
                  "error",
                  "Unexpected error serving static file for React track",
                  { error: getErrorLikeStringFromUnknown(error) }
                );
                context.response.status(500);
              }
            );
          } else {
            context.response.status(404);
          }
        } else {
          // Here, there's no static file to serve, and the endpoint is a catch-all. So
          // serve the `index.html` file from the root of the build folder.
          response.sendFile(
            path.basename(rootHtmlFile),
            {
              maxAge: 0,
              root: path.dirname(rootHtmlFile),
              dotfiles: "ignore",
            },
            (error) => {
              if (!error) {
                return;
              }
              context.log(
                "error",
                "Unexpected error serving index file for React track",
                { error: getErrorLikeStringFromUnknown(error) }
              );
              context.response.status(500);
            }
          );
        }
      },
      endpoint: trackOptions.endpoint,
      method: "ALL",
      middleware: trackOptions.middleware,
    };
  };
}

function getRequestedPath({
  url,
  buildFolder,
}: {
  url: string;
  buildFolder: string;
}): string {
  return path.join(buildFolder, url);
}

function isOkToServePath({
  requestedPath,
  buildFolder,
}: {
  requestedPath: string;
  buildFolder: string;
}): boolean {
  const resolvedPath = path.resolve(requestedPath);
  if (!path.isAbsolute(resolvedPath)) {
    return false;
  }
  return requestedPath.startsWith(buildFolder);
}
