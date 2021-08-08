import { MetaData } from "./generators";

export function getMockMetaData(): MetaData {
  return {
    entityTableNames: new Map(),
    setHeader: jest.fn(),
    tableEntityNames: new Map(),
    rawBaseQueryFunctionNames: new Map(),
    connectionInfo: {} as any,
    transformerFunctionNames: {},
    typeAssertionFunctionNames: new Map(),
    typeGuardFunctionNames: new Map(),
    tableRawEntityNames: new Map(),
  };
}
