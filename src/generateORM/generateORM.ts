import { db, ConnectionOptions } from "./";
import { SchemaFetcher } from "./drivers";
import { Generator, MetaData } from "./generators";
import { PostProcessor } from "./postProcessors";

interface GenerateORMOptions {
  connectionOptions: ConnectionOptions;
  fetcher: SchemaFetcher;
  generators: Generator[];
  postProcessors: PostProcessor[];
}

export async function generateORM(
  options: GenerateORMOptions
): Promise<string> {
  const connection = db(options.connectionOptions);
  const rawSchemas = await options.fetcher(connection);

  let code = "";
  const headers = new Map<string, string>();
  const metaData: MetaData = {
    setHeader: (key: string, value: string) => headers.set(key, value),
    entityTableNames: new Map(),
    rawBaseQueryFunctionNames: new Map(),
    tableEntityNames: new Map(),
    tableRawEntityNames: new Map(),
    typeAssertionFunctionNames: new Map(),
    typeGuardFunctionNames: new Map(),
    transformerFunctionNames: {},
  };

  for (const generator of options.generators) {
    for (const rawSchema of rawSchemas) {
      let generatorResult = await generator(rawSchema, metaData);
      while (typeof generatorResult === "function") {
        generatorResult = await generatorResult(rawSchema, metaData);
      }
      code += generatorResult;
    }
  }

  for (const header of headers.values()) {
    code = header + "\n" + code;
  }

  return code;
}
