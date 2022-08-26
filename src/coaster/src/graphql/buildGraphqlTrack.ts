import path from "path";

import { CoasterError, perform } from "@baublet/coaster-utils";

import { BuildTools } from "../build/types";

export async function buildGraphqlTrack({
  schemaPath,
  tools,
  contextType,
  customConfig = {},
}: {
  schemaPath: string;
  tools: BuildTools;
  contextType: string;
  customConfig?: Record<string, any>;
}): Promise<void | CoasterError> {
  const { generate } = await import("@graphql-codegen/cli");
  const baseName = path.basename(schemaPath);
  const outputFile = path.resolve(path.dirname(schemaPath), `${baseName}.ts`);

  return perform(async () => {
    tools.log.debug(`Generating GraphQL types from ${schemaPath}`);
    await generate({
      silent: true,
      schema: schemaPath,
      generates: {
        [outputFile]: {
          config: {
            contextType,
            enumsAsConst: true,
            enumsAsTypes: true,
            maybeValue: "T | undefined",
            inputMaybeValue: "T | null | undefined",
            ...customConfig,
          },
          plugins: [
            "typescript",
            "typescript-operations",
            "typescript-resolvers",
          ],
        },
      },
    });
  });
}
