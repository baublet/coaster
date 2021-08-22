import { db, ConnectionOptions } from "./";
import { SchemaFetcher } from "./drivers";
import { Generator, MetaData } from "./generators";
import { PostProcessor } from "./postProcessors";

interface GenerateORMOptions {
  generateTestCode?: boolean;
  testConnectionVariable?: string;
  testHeaders?: string;
  codeOutputFullPath?: string;
  connectionOptions: ConnectionOptions;
  fetcher: SchemaFetcher;
  generators: Generator[];
  postProcessors: PostProcessor[];
}

export async function generateORM(options: GenerateORMOptions): Promise<{
  code: string;
  testCode: string;
}> {
  const connection = db(options.connectionOptions);
  const rawSchemas = await options.fetcher(connection);
  await connection.destroy();
  const codeOutputFullPath = options.codeOutputFullPath || "./generated";

  let code = "";
  let testCode = options.testHeaders ? options.testHeaders + "\n" : "";

  const headers = new Map<string, string>();
  const metaData: MetaData = {
    testConnectionVariable: options.testConnectionVariable || "connection",
    codeOutputFullPath,
    generateTestCode: Boolean(options.generateTestCode),
    setHeader: (key: string, value: string) => headers.set(key, value),
    entityTableNames: new Map(),
    rawBaseQueryFunctionNames: new Map(),
    tableEntityNames: new Map(),
    tableRawEntityNames: new Map(),
    typeAssertionFunctionNames: new Map(),
    typeGuardFunctionNames: new Map(),
    transformerFunctionNames: {},
    namedEntityColumnNames: new Map(),
    namedEntityInputTypeNames: new Map(),
    namedDatabaseEnumNames: new Map(),
    rawDatabaseEnumNames: new Map(),
  };

  for (const generator of options.generators) {
    for (const rawSchema of rawSchemas) {
      let generatorResult = await generator(rawSchema, metaData);
      while (typeof generatorResult === "function") {
        generatorResult = await generatorResult(rawSchema, metaData);
      }
      code += generatorResult.code;
      testCode += generatorResult.testCode;
    }
  }

  for (const header of headers.values()) {
    code = header + "\n" + code;
  }

  return {
    code,
    testCode,
  };
}
