import { Database, db } from "./";
import { SchemaFetcher } from "./drivers";
import { Generator, MetaData } from "./generators";

interface GenerateORMOptions<T extends SchemaFetcher> {
  connectionOptions: Parameters<Database>;
  fetcher: T;
  fetcherOptions: Parameters<T>[1];
  generators: Generator[];
}

export async function generateORM<T extends SchemaFetcher>(
  options: GenerateORMOptions<T>
): Promise<string> {
  const connection = db(...options.connectionOptions);
  const rawSchemas = await options.fetcher(connection, options.fetcherOptions);

  let code = "";
  const headers = new Map<string, string>();
  const metaData: MetaData = {
    setHeader: (key: string, value: string) => headers.set(key, value),
    entityTableNames: new Map<string, string>(),
    rawBaseQueryFunctionNames: new Map<string, string>(),
    tableEntityNames: new Map<string, string>(),
    connectionInfo: options.connectionOptions,
  };

  for (const generator of options.generators) {
    for (const rawSchema of rawSchemas) {
      let generatorResult = await generator(rawSchema, metaData);
      while (typeof generatorResult === "function") {
        generatorResult = await generator(rawSchema, metaData);
      }
      code += generatorResult;
    }
  }

  return code;
}
