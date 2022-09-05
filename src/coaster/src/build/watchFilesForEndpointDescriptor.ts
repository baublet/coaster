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

import { hashString } from "../common/hashString";
import { NormalizedManifest } from "../manifest/types";

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
    return fileExistsResult;
  }

  // No file here, yet, nothing to watch!
  if (!fileExistsResult) {
    return [];
  }

  const fileContents = await readFile(pathToFile);
  if (isCoasterError(fileContents)) {
    return fileContents;
  }

  const parsedFileContents = jsonParse(fileContents);
  if (isCoasterError(parsedFileContents)) {
    return parsedFileContents;
  }

  const paths: string[] = [];
  if (Array.isArray(parsedFileContents)) {
    for (const wildcardPath of parsedFileContents) {
      if (typeof wildcardPath === "string") {
        paths.push(wildcardPath);
      } else {
        // TODO: log this
      }
    }
  } else {
    // TODO: log this
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
      return stringifyResult;
    }
    const writeResult = await writeFile(pathToFile, stringifyResult);
    if (isCoasterError(writeResult)) {
      return writeResult;
    }
  } catch (error) {
    return createCoasterError({
      code: "saveWatchFilesForEndpoint",
      message: `Unexpected error saving watch files for endpoint: ${endpointDescriptorInManifest}`,
      details: {
        endpointDescriptorInManifest,
        pathToFile,
        error,
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
  path: string
): Promise<boolean> {
  const endpointPaths = await Promise.all(
    loadedManifest.endpoints.map((endpoint) =>
      getWatchFilesForEndpointDescriptor(endpoint.file)
    )
  );

  const allPaths = new Set<string>();
  for (const endpointPath of endpointPaths) {
    if (isCoasterError(endpointPath)) {
      // TODO: log this
      continue;
    }
    for (const path of endpointPath) {
      allPaths.add(path);
    }
  }

  const allPathsArray = Array.from(allPaths);
  const matcher = createMatcher(allPathsArray);

  return matcher(path);
}
