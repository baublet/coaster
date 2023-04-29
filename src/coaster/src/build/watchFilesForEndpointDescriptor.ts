import path from "path";

import mkdirp from "mkdirp";
import createMatcher from "wildcard-match";

import { readFile, fileExists, writeFile } from "@baublet/coaster-fs";
import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  jsonParse,
  jsonStringify,
} from "@baublet/coaster-utils";
import { log } from "@baublet/coaster-log-service";

import { hashString } from "../common/hashString";
import { NormalizedManifest } from "../manifest/types";
import { logCoasterError } from "../cli/utils/logCoasterError";

/**
 * When building an endpoint, our main CLI process won't load the endpoint from the
 * manifest, because that can get expensive (if there's lots of files on the disk,
 * or if there are side effects before loading). Thus, if we want the build script
 * to automatically reload, we have to have some way of it knowing what files or
 * paths to watch. The functions in this file are responsible for saving and loading
 * a file to disk that stores that data for the main CLI process.
 */

export async function getWatchFilesForEndpointDescriptor(
  endpointDescriptorInManifest: string
): Promise<CoasterError | string[]> {
  const pathToFile = getEndpointWatchFilePath(endpointDescriptorInManifest);

  const fileExistsResult = await fileExists(pathToFile);
  if (isCoasterError(fileExistsResult)) {
    return createCoasterError({
      code: "getWatchFilesForEndpointDescriptor-fileExistsError",
      message:
        "Unexpected checking if endpoint descriptor file exists. This is likely to be a low-level system error",
      details: {
        pathToFile,
      },
      previousError: fileExistsResult,
    });
  }

  // No file here, yet, nothing to watch!
  if (!fileExistsResult) {
    return [];
  }

  const fileContents = await readFile(pathToFile);
  if (isCoasterError(fileContents)) {
    return createCoasterError({
      code: "getWatchFilesForEndpointDescriptor-readFileError",
      message: "Unexpected error reading endpoint descriptor",
      details: {
        path: pathToFile,
      },
      previousError: fileContents,
    });
  }

  const parsedFileContents = jsonParse(fileContents);
  if (isCoasterError(parsedFileContents)) {
    return createCoasterError({
      code: "getWatchFilesForEndpointDescriptor-parseError",
      message: "Unexpected error parsing endpoint descriptor",
      details: {
        pathToFile,
        fileContents,
      },
      previousError: parsedFileContents,
    });
  }

  const paths: string[] = [];
  if (Array.isArray(parsedFileContents)) {
    for (const wildcardPath of parsedFileContents) {
      if (typeof wildcardPath === "string") {
        paths.push(wildcardPath);
      } else {
        log.error(
          `Wildcard path is not a string. It is instead a ${typeof wildcardPath} (${wildcardPath})`
        );
      }
    }
  } else {
    log.error(
      `File contents is not an array. It is instead a ${typeof parsedFileContents} (${parsedFileContents})`
    );
  }

  return paths;
}

export async function saveWatchFilesForEndpointDescriptor(
  endpointDescriptorInManifest: string,
  watchFiles: string[]
): Promise<undefined | CoasterError> {
  const pathToFile = getEndpointWatchFilePath(endpointDescriptorInManifest);
  try {
    await mkdirp(path.dirname(pathToFile));
    const stringifyResult = jsonStringify(watchFiles);
    if (isCoasterError(stringifyResult)) {
      return createCoasterError({
        code: "saveWatchFilesForEndpointDescriptor-stringifyError",
        message: "Unexpected error stringifying watch files",
        details: {
          pathToFile,
          watchFiles,
        },
        previousError: stringifyResult,
      });
    }
    const writeResult = await writeFile(pathToFile, stringifyResult);
    if (isCoasterError(writeResult)) {
      return createCoasterError({
        code: "saveWatchFilesForEndpointDescriptor-writeFileError",
        message: "Unexpected error writing watch files",
        details: {
          pathToFile,
          watchFiles,
        },
        previousError: writeResult,
      });
    }
  } catch (error) {
    return createCoasterError({
      code: "saveWatchFilesForEndpoint",
      message: `Unexpected error saving watch files for endpoint: ${endpointDescriptorInManifest}`,
      error,
      details: {
        endpointDescriptorInManifest,
        pathToFile,
      },
    });
  }
}

function getEndpointWatchFilePath(
  endpointDescriptorInManifest: string
): string {
  return path.resolve(
    process.cwd(),
    "node_modules",
    ".coaster",
    hashString(endpointDescriptorInManifest) + ".buildWatch.json"
  );
}

export async function shouldRebuild(
  loadedManifest: NormalizedManifest,
  changedPath: string
): Promise<boolean> {
  const uiPathToFilter = loadedManifest.ui
    ? path.dirname(loadedManifest.ui.file)
    : undefined;

  const endpointPaths = await Promise.all(
    loadedManifest.endpoints.map((endpoint) =>
      getWatchFilesForEndpointDescriptor(endpoint.file)
    )
  );

  const allPaths = new Set<string>();
  for (const endpointPath of endpointPaths) {
    if (isCoasterError(endpointPath)) {
      logCoasterError(endpointPath);
      continue;
    }
    for (const path of endpointPath) {
      if (uiPathToFilter && path.startsWith(uiPathToFilter)) {
        continue;
      }
      allPaths.add(path);
    }
  }

  const allPathsArray = Array.from(allPaths);
  const matcher = createMatcher(allPathsArray);

  return matcher(changedPath);
}
