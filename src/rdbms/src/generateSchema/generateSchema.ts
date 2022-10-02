import {
  CoasterError,
  createCoasterError,
  perform,
} from "@baublet/coaster-utils";

import { GenerateCoasterRdbmsConnectionOptions, RdbmsSchema } from "../types";
import { postgres } from "./postgres";

/**
 * Given a set of connection options and some configuration information, generates
 * an RdbmsSchema type that represents the schema of the database. This schema
 * is then used to build a connector for the schema for code to interact with.
 */
export async function generateSchema(
  options: GenerateCoasterRdbmsConnectionOptions
): Promise<RdbmsSchema | CoasterError> {
  switch (options.config.client) {
    case "postgres":
      return perform(() => postgres(options));
  }

  return createCoasterError({
    code: "generateSchema/unknownClient",
    message: `Unsupported database type: ${options.config.client}`,
    details: { options },
  });
}
