import JSON5 from "json5";

import { readFile } from "@baublet/coaster-fs";
import {
  CoasterError,
  createCoasterError,
  isCoasterError,
  asTypeOrError,
  fullyResolve,
  getItemOrArrayOfItems,
  arrayHasNoCoasterErrors,
} from "@baublet/coaster-utils";

import {
  FileDescriptor,
  NormalizedFileDescriptor,
  NormalizedManifest,
} from "./types";
import { getNormalizedFileDescriptorFromFileInput } from "../common/getNormalizedFileDescriptorFromFileInput";

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
      return parseManifest(resolvedManifestNode, path);
    }

    return parseManifest(manifestNode, path);
  }

  const manifestString = await readFile(path, options);

  if (isCoasterError(manifestString)) {
    return createCoasterError({
      code: `loadRawManifest-readFile`,
      message: `Error reading manifest file ${path}`,
      previousError: manifestString,
      details: { path, options },
    });
  }

  try {
    const manifest: unknown = JSON5.parse(manifestString);
    return await parseManifest(manifest, path);
  } catch (error) {
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
  manifest: unknown,
  fullPath: string
): Promise<NormalizedManifest | CoasterError> {
  const rootNode = asTypeOrError("object", manifest);
  if (isCoasterError(rootNode)) {
    return createCoasterError({
      code: `parseManifest-rootNode`,
      message: `Expected manifest root node an object, got a ${typeof manifest}`,
      previousError: rootNode,
    });
  }

  const name = asTypeOrError("string", rootNode.name);
  if (isCoasterError(name)) {
    return createCoasterError({
      code: `parseManifest-name`,
      message: `Expected manifest name to be a string, got a ${typeof rootNode.name}`,
      previousError: name,
    });
  }

  const port = rootNode.port || DEFAULT_PORT;
  const numericPort = Number(port);
  if (isNaN(numericPort)) {
    return createCoasterError({
      code: `parseManifest-port-notANumber`,
      message: `Expected manifest port to be a numeric string or number, got ${port} (NaN)`,
    });
  }
  if (numericPort === Infinity) {
    return createCoasterError({
      code: `parseManifest-port-infinity`,
      message: `Expected manifest port to be a numeric string or number, got ${port} (Infinity)`,
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
      previousError: key,
    });
  }

  const endpointsArray = getItemOrArrayOfItems(rootNode.endpoints);
  const endpoints = endpointsArray.map((endpoint: FileDescriptor | string) =>
    getNormalizedFileDescriptorFromFileInput({
      exportNameIfNotSpecified: "endpoint",
      fileInput: endpoint,
      referenceFileFullPath: fullPath,
    })
  );

  if (!arrayHasNoCoasterErrors(endpoints)) {
    return createCoasterError({
      code: `parseManifest-endpoints`,
      message: `Error parsing endpoints`,
      details: {
        errors: endpoints.filter(isCoasterError),
      },
    });
  }

  const notFound = getNormalizedFileDescriptorFromFileInput({
    fileInput: rootNode.notFound,
    exportNameIfNotSpecified: "notFound",
    referenceFileFullPath: fullPath,
  });
  if (isCoasterError(notFound)) {
    return createCoasterError({
      code: `parseManifest-notFound`,
      message: `Error parsing notFound`,
      details: { fileInput: rootNode.notFound, referenceFile: fullPath },
      previousError: notFound,
    });
  }

  const ui = getNormalizedFileDescriptorFromFileInput({
    fileInput: rootNode.ui,
    exportNameIfNotSpecified: "ui",
    referenceFileFullPath: fullPath,
  });
  if (isCoasterError(ui)) {
    return createCoasterError({
      code: `parseManifest-ui`,
      message: `Error parsing ui`,
      details: { fileInput: rootNode.ui, referenceFile: fullPath },
      previousError: ui,
    });
  }

  const middlewareArray = getItemOrArrayOfItems<string | FileDescriptor>(
    rootNode.middleware
  );
  const middleware = middlewareArray.map((middleware) =>
    getNormalizedFileDescriptorFromFileInput({
      exportNameIfNotSpecified: "middleware",
      fileInput: middleware,
      referenceFileFullPath: fullPath,
    })
  );

  if (!arrayHasNoCoasterErrors(middleware)) {
    return createCoasterError({
      code: `parseManifest-middleware`,
      message: `Error parsing middleware`,
      details: {
        errors: middleware.filter(isCoasterError),
      },
    });
  }

  return {
    __coasterManifestFullPath: fullPath,
    name,
    port: port,
    key,
    endpoints: endpoints as NormalizedFileDescriptor[],
    notFound,
    middleware: middleware as NormalizedFileDescriptor[],
    ui,
  };
}
