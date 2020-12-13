import { existsSync } from "fs";

// import { createSchema } from "../createSchema";
import {
  CoasterApplicationFactory,
  CoasterApplicationConfigurationBase,
  CoasterRequestHandler,
} from "../types";
import { getPathAndExport } from "helpers/getPathAndExport";

export interface CoasterGraphQLApplicationConfiguration
  extends CoasterApplicationConfigurationBase {
  /**
   * Path to the file exporting your executable schema. Default: "./src/graphql/schema.ts"
   */
  resolversPath: string;
  /**
   * Path to your schema file. Default: "./src/graphql/schema.graphql"
   */
  schemaPath: string;
}

export const GraphQL: CoasterApplicationFactory = async (
  config: CoasterGraphQLApplicationConfiguration
) => {
  if (!existsSync(config.resolversPath)) {
    throw new Error(`Cannot find resolvers file: ${config.resolversPath}`);
  }

  if (!existsSync(config.schemaPath)) {
    throw new Error(`Cannot find schema file: ${config.resolversPath}`);
  }

  const {
    path: resolversPath,
    exportName: resolversExportName,
  } = getPathAndExport(config.resolversPath);
  const resolversImport = await import(resolversPath);

  if (!(resolversExportName in resolversImport)) {
    throw new Error(
      `Resolvers import does not contain an export for: ${resolversExportName}`
    );
  }

  // const resolvers = resolversImport[resolversExportName];

  // const loadedSchema = createSchema({
  //   schemaDefinition: config.schemaPath,
  //   resolvers: resolvers,
  // });

  const handleRequest: CoasterRequestHandler = () => {};

  const initialize = () => {};

  const teardown = () => {};

  return {
    initialize,
    teardown,
    handleRequest,
  };
};
