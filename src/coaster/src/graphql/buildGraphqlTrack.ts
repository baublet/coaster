import path from "path";
import { CoasterError, perform } from "@baublet/coaster-utils";
import { BuildTools } from "../build/types";

export async function buildGraphqlTrack({
  schemaPath,
  tools,
}: {
  schemaPath: string;
  tools: BuildTools;
}): Promise<void | CoasterError> {
  const { generate } = await import("@graphql-codegen/cli");
  const baseName = path.basename(schemaPath);
  const outputFile = path.resolve(path.dirname(schemaPath), `${baseName}.ts`);

  return perform(async () => {
    tools.log.debug(`Generating GraphQL types from ${schemaPath}`);
    await generate({
      silent: true,
      schema: schemaPath,
      // documents: "./src/resolvers/**/*.ts",
      generates: {
        [outputFile]: {
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
