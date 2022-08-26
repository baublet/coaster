import JSON5 from "json5";

import { readFile } from "@baublet/coaster-fs";
import {
  assertIsError,
  CoasterError,
  createCoasterError,
  isCoasterError,
  asTypeOrError,
  fullyResolve,
} from "@baublet/coaster-utils";

import { NormalizedManifest } from "./types";
import { normalizeFileDescriptor } from "./normalizeFileDescriptor";

const DEFAULT_PORT = process.env.COASTER_PORT || 8080;

export async function loadRawManifest(
  path: string,
  options: Parameters<typeof readFile>[1] = {}
): Promise<NormalizedManifest | CoasterError> {
  // If it's a .ts file, just import it!
  if (path.endsWith(".ts")) {
    const importedFile = await import(path);

    const manifestDeclarationExists = "manifest" in importedFile;
    if (!manifestDeclarationExists) {
      return createCoasterError({
        code: `loadRawManifest-noManifest`,
        message: `Expected manifest to be exported as an object or function called "manifest". But there was no such export in ${path}`,
      });
    }

    const manifestNode = importedFile.manifest;

    if (typeof manifestNode === "function") {
      const resolvedManifestNode = await fullyResolve(manifestNode);
      return parseManifest(resolvedManifestNode);
    }

    return parseManifest(manifestNode);
  }

  const manifestString = await readFile(path, options);

  if (isCoasterError(manifestString)) {
    return manifestString;
  }

  try {
    const manifest: unknown = JSON5.parse(manifestString);
    return await parseManifest(manifest);
  } catch (error) {
    assertIsError(error);
    return createCoasterError({
      code: "loadRawManifest-parseError",
      message: `Error parsing manifest file: ${path}`,
      error,
      details: {
        path,
      },
    });
  }
}

async function parseManifest(
  manifest: unknown
): Promise<NormalizedManifest | CoasterError> {
  const rootNode = asTypeOrError("object", manifest);
  if (isCoasterError(rootNode)) {
    return createCoasterError({
      code: `parseManifest-rootNode`,
      message: `Expected manifest root node an object, got a ${typeof manifest}`,
    });
  }

  const name = asTypeOrError("string", rootNode.name);
  if (isCoasterError(name)) {
    return createCoasterError({
      code: `parseManifest-name`,
      message: `Expected manifest name to be a string, got a ${typeof rootNode.name}`,
    });
  }

  const port = rootNode.port || DEFAULT_PORT;
  const numericPort = Number(port);
  if (isNaN(numericPort)) {
    return createCoasterError({
      code: `parseManifest-port-notANumber`,
      message: `Expected manifest port to be a numeric string or number, got ${port}`,
    });
  }
  if (numericPort === Infinity) {
    return createCoasterError({
      code: `parseManifest-port-infinity`,
      message: `Expected manifest port to be a numeric string or number, got ${port}`,
    });
  }
  if (numericPort % 1 !== 0) {
    return createCoasterError({
      code: `parseManifest-port-float`,
      message: `Expected manifest port to be a whole number, got ${port}`,
    });
  }
  if (numericPort < 0 || numericPort > 65535) {
    return createCoasterError({
      code: `parseManifest-port-range`,
      message: `Expected manifest port to be a number between 0 and 65535, got ${port}`,
    });
  }

  const rawKey = rootNode.key;
  const key =
    rawKey !== undefined ? asTypeOrError("string", rootNode.key) : name;
  if (isCoasterError(key)) {
    return createCoasterError({
      code: `parseManifest-key`,
      message: `Expected manifest key to be a string, got a ${typeof rootNode.key}`,
    });
  }

  const endpoints = normalizeFileDescriptor(rootNode.endpoints);
  if (isCoasterError(endpoints)) {
    return endpoints;
  }

  const notFound = normalizeFileDescriptor(rootNode.notFound);
  if (isCoasterError(notFound)) {
    return notFound;
  }

  const middleware = normalizeFileDescriptor(rootNode.middleware);
  if (isCoasterError(middleware)) {
    return middleware;
  }

  return {
    name,
    port: port,
    key,
    endpoints,
    notFound: notFound[0],
    middleware,
    deployments: [],
  };
}
