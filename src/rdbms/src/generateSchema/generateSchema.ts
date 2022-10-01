import { RdbmsConfig, RdbmsSchema } from "../types";

/**
 * Given a set of connection options and some configuration information, generates
 * an RdbmsSchema type that represents the schema of the database. This schema
 * is then used to build a connector for the schema for code to interact with.
 */
export async function generateSchema({
  connectionOptions,
}: {
  connectionOptions: RdbmsConfig;
}): Promise<RdbmsSchema> {}
