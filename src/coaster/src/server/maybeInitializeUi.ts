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

export async function maybeInitializeUi({
  manifest,
  app,
  manifestFullPath,
}: {
  manifest: NormalizedManifest;
  app: Express;
  manifestFullPath: string;
}): Promise<undefined | CoasterError> {
  const manifestUi = manifest.ui;

  if (!manifestUi) {
    return;
  }

  const uiFullPath = resolveInputPathFromFile(
    manifest.notFound.file,
    manifestFullPath
  );
  const resolvedUiEndpoint = await getEndpointFromFileDescriptor({
    fileDescriptor: {
      file: uiFullPath,
      exportName: manifestUi.exportName,
    },
    endpointFileFullPath: uiFullPath,
  });
  if (!resolvedUiEndpoint) {
    return createCoasterError({
      code: "createServer-ui-not-found",
      message: `UI not found`,
      details: {
        ui: JSON.stringify(manifest.ui),
      },
    });
  }

  if (isCoasterError(resolvedUiEndpoint)) {
    return createCoasterError({
      code: "createExpressServer-unexpected-error-loading-ui-endpoint",
      message: `Error loading ui endpoint from ${manifestFullPath}`,
      details: { manifestFullPath },
      previousError: resolvedUiEndpoint,
    });
  }

  log.debug(colors.dim("Registering not found endpoint"));
  app.use((request, response) => {
    handleExpressMethodWithHandler({
      request,
      response,
      handler: resolvedUiEndpoint.handler,
    });
  });
}
