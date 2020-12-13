import { resolve } from "path";
import { existsSync } from "fs";

import { CoasterConfig } from "../types";
import { GraphQL } from "drivers/GraphQL";
import { getPathAndExport } from "helpers/getPathAndExport";

const COASTER_CONFIG_DEFAULT_FILE_NAME = "coaster.ts";

function getDefaultConfigPathName() {
  return resolve(process.cwd(), COASTER_CONFIG_DEFAULT_FILE_NAME);
}

function getDefaultConfiguration(): CoasterConfig {
  return {
    applications: [
      {
        name: "graphql",
        resolversPath: "./src/graphql/resolver.ts",
        schemaPath: "./src/graphql/schema.graphql",
        driver: GraphQL,
      },
    ],
  };
}

export function getConfig(
  pathString: string = getDefaultConfigPathName()
): CoasterConfig {
  const { path, exportName } = getPathAndExport(pathString);

  if (!existsSync(path)) {
    return getDefaultConfiguration();
  }

  const loadedConfig = require(path);

  if (exportName in loadedConfig) {
    return loadedConfig[exportName];
  }

  throw new Error(
    `Imported file does not export a property named ${exportName}. Keys: ${Object.keys(
      loadedConfig
    )}`
  );
}
