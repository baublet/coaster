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
  tools.log.info("Loading GraphQL-Codegen tools");
  tools.setProgress(3, 100); // arbitrary, unless someone has a better idea

  const { generate } = await import("@graphql-codegen/cli");
  tools.setProgress(45, 100);

  const baseName = path.basename(schemaPath);
  const outputFile = path.resolve(
    path.dirname(schemaPath),
    `${baseName}.generated.ts`
  );
  tools.setProgress(47, 100);

  const result = perform(async () => {
    tools.log.debug(`Generating GraphQL types from ${schemaPath}`);
    tools.setProgress(50, 100);
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
    tools.log.debug("GraphQL types generated");
    tools.setProgress(99, 100);
  });
  tools.setProgress(100, 100);
  return result;
}
