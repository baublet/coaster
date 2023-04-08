import type { Express } from "express";
import colors from "@colors/colors";

import {
  CoasterError,
  createCoasterError,
  isCoasterError,
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { resolveInputPathFromFile } from "../common/resolveInputPathFromFile";
import { getEndpointFromFileDescriptor } from "../endpoints/getEndpointFromFileDescriptor";

import { NormalizedManifest } from "../manifest/types";
import { handleExpressMethodWithHandler } from "./handleExpressMethodWithHandler";

export async function maybeInitializeNotFound({
  manifest,
  app,
  manifestFullPath,
}: {
  manifest: NormalizedManifest;
  app: Express;
  manifestFullPath: string;
}): Promise<undefined | CoasterError> {
  if (!manifest.notFound) {
    return;
  }
  const notFoundFullPath = resolveInputPathFromFile(
    manifest.notFound.file,
    manifestFullPath
  );
  const resolvedNotFoundEndpoint = await getEndpointFromFileDescriptor({
    fileDescriptor: {
      file: notFoundFullPath,
      exportName: manifest.notFound.exportName,
    },
    endpointFileFullPath: notFoundFullPath,
  });
  if (!resolvedNotFoundEndpoint) {
    return createCoasterError({
      code: "createServer-not-found-endpoint-not-found",
      message: `Not found endpoint not found`,
      details: {
        notFound: JSON.stringify(manifest.notFound),
      },
    });
  }

  if (isCoasterError(resolvedNotFoundEndpoint)) {
    return createCoasterError({
      code: "createExpressServer-unexpected-error-loading-not-found-endpoint",
      message: `Error loading not found endpoint from ${manifestFullPath}`,
      details: { manifestFullPath },
      previousError: resolvedNotFoundEndpoint,
    });
  }

  log.debug(colors.dim("Registering not found endpoint"));
  app.use((request, response) => {
    handleExpressMethodWithHandler({
      request,
      response,
      handler: resolvedNotFoundEndpoint.handler,
    });
  });
}
