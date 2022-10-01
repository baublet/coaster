import { RdbmsSchema } from "../types";

/**
 * Given a schema, generates the code for an RDBMS connector that can then be
 * saved to disk and utilized in downstream code.
 */
export async function generateConnectorFromSchema({
  schema,
}: {
  schema: RdbmsSchema;
}): Promise<string> {
  const chunks: string[] = [];

  return chunks.join("\n");
}
