import { db, ConnectionOptions } from "./";
import { SchemaFetcher } from "./drivers";
import { Generator, MetaData } from "./generators";
import { getTemplateManager } from "./generators/helpers";
import { PostProcessor } from "./postProcessors";

interface GenerateORMOptions {
  generateTestCode?: boolean;
  generateTestDbMigrations?: boolean;
  testConnectionVariable?: string;
  testConnectionString?: string;
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
  const testHeaders = new Map<string, string>();
  const metaData: MetaData = {
    testConnectionVariable: options.testConnectionVariable || "connection",
    testConnectionString:
      options.testConnectionString ||
      JSON.stringify({
        client: "sqlite3",
        connection: ":memory:",
        useNullAsDefault: true,
      }),
    codeOutputFullPath,
    entityTableNames: new Map(),
    generateTestCode: Boolean(options.generateTestCode),
    generateTestDbMigrations:
      options.generateTestDbMigrations === false ? false : true,
    namedCreateTestEntityFunctionNames: new Map(),
    namedDatabaseEnumNames: new Map(),
    namedEntityColumnNames: new Map(),
    namedEntityInputTypeNames: new Map(),
    namedMockEntityFunctionNames: new Map(),
    rawBaseQueryFunctionNames: new Map(),
    rawCreateTestEntityFunctionNames: new Map(),
    rawDatabaseEnumNames: new Map(),
    rawEnumValues: new Map(),
    rawMockEntityFunctionNames: new Map(),
    setHeader: (key: string, value: string) => headers.set(key, value),
    setTestHeader: (key: string, value: string) => testHeaders.set(key, value),
    tableEntityNames: new Map(),
    tableRawEntityNames: new Map(),
    templateManager: getTemplateManager(),
    transformerFunctionNames: {},
    typeAssertionFunctionNames: new Map(),
    typeGuardFunctionNames: new Map(),
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

  for (const [headerName, header] of headers.entries()) {
    code = `// Header: ${headerName}` + "\n" + header + "\n" + code;
  }

  for (const [headerName, header] of testHeaders.entries()) {
    testCode =
      `// Test header: ${headerName}` + "\n" + header + "\n" + testCode;
  }

  return {
    code,
    testCode,
  };
}
