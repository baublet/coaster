import { MetaData } from "./generators";

export function getMockMetaData(): MetaData {
  return {
    testConnectionVariable: "connection",
    codeOutputFullPath: "./generated.ts",
    generateTestCode: false,
    entityTableNames: new Map(),
    setHeader: jest.fn(),
    tableEntityNames: new Map(),
    rawBaseQueryFunctionNames: new Map(),
    transformerFunctionNames: {},
    typeAssertionFunctionNames: new Map(),
    typeGuardFunctionNames: new Map(),
    tableRawEntityNames: new Map(),
    namedEntityColumnNames: new Map(),
    namedEntityInputTypeNames: new Map(),
    namedDatabaseEnumNames: new Map(),
    rawDatabaseEnumNames: new Map(),
  };
}
