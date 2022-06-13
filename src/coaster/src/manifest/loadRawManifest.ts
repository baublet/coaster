import JSON5 from "json5";

import { readFile } from "@baublet/coaster-fs";
import {
  assertIsError,
  CoasterError,
  createCoasterError,
  isCoasterError,
  asTypeOrError,
  jsonStringify,
} from "@baublet/coaster-utils";

import { NormalizedManifest } from "./types";
import { normalizeFileDescriptor } from "./normalizeFileDescriptor";

const DEFAULT_PORT = process.env.COASTER_PORT || 8080;

export async function loadRawManifest(
  path: string,
  options: Parameters<typeof readFile>[1] = {}
): Promise<NormalizedManifest | CoasterError> {
  const manifestString = await readFile(path, options);

  if (isCoasterError(manifestString)) {
    return manifestString;
  }

  try {
    const manifest: unknown = JSON5.parse(manifestString);
    const castedValue = await parseManifest(manifest);

    return castedValue;
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

  const components = normalizeFileDescriptor(rootNode.components);
  if (isCoasterError(components)) {
    const stringifiedComponents = jsonStringify(rootNode.components);
    if (isCoasterError(stringifiedComponents)) {
      return createCoasterError({
        code: `parseManifest-components-stringify`,
        message: `Unexpected error inspecting manifest components`,
        error: stringifiedComponents,
      });
    }
    return createCoasterError({
      code: `parseManifest-components`,
      message: `One or more of the components are invalid`,
      error: components,
      details: { components: stringifiedComponents },
    });
  }

  const endpoints = normalizeFileDescriptor(rootNode.components);
  if (isCoasterError(endpoints)) {
    const stringifiedEndpoints = jsonStringify(rootNode.endpoints);
    if (isCoasterError(stringifiedEndpoints)) {
      return createCoasterError({
        code: `parseManifest-Endpoints-stringify`,
        message: `Unexpected error inspecting manifest Endpoints`,
        error: stringifiedEndpoints,
      });
    }
    return createCoasterError({
      code: `parseManifest-Endpoints`,
      message: `One or more of the components are invalid`,
      error: endpoints,
      details: { components: stringifiedEndpoints },
    });
  }

  const schemas = normalizeFileDescriptor(rootNode.schemas);
  if (isCoasterError(schemas)) {
    const stringifiedSchema = jsonStringify(rootNode.schemas);
    if (isCoasterError(stringifiedSchema)) {
      return createCoasterError({
        code: `parseManifest-schema-stringify`,
        message: `Unexpected error inspecting manifest schemas`,
        error: stringifiedSchema,
      });
    }
    return createCoasterError({
      code: `parseManifest-schemas`,
      message: `One or more of the schema are invalid`,
      error: schemas,
      details: { components: stringifiedSchema },
    });
  }

  return {
    name,
    port: port,
    key,
    components,
    endpoints,
    schemas,
  };
}
