import { DatabaseConnection } from "./";
import { SchemaFetcher } from "./drivers";
import { Generator, MetaData } from "./generators";

interface GenerateORMOptions<T extends SchemaFetcher> {
  connection: DatabaseConnection;
  fetcher: T;
  fetcherOptions: Parameters<T>[1];
  generators: [Generator, Parameters<Generator>[2]][];
}

export async function generateORM<T extends SchemaFetcher>(
  options: GenerateORMOptions<T>
): Promise<string> {
  const rawSchemas = await options.fetcher(
    options.connection,
    options.fetcherOptions
  );

  let code = "";
  const metaData: MetaData = {};

  for (const [generator, generatorOptions] of options.generators) {
    for (const rawSchema of rawSchemas) {
      code += await generator(rawSchema, metaData, generatorOptions);
    }
  }

  return code;
}
