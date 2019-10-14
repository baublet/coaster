import { Database } from "better-sqlite3";

export default () => {
  const statements: Record<string, any> = {};
  return ({
    prepare: (statement: string) => {
      if (!statements[statement]) {
        statements[statement] = {
          run: jest.fn(),
          get: jest.fn(),
          all: jest.fn(),
          iterate: jest.fn(),
          pluck: jest.fn(),
          expand: jest.fn(),
          raw: jest.fn(),
          columns: jest.fn(),
          bind: jest.fn()
        };
      }
      return statements[statement];
    },
    transaction: (fn: () => void) => fn(),
    pragma: jest.fn(),
    close: jest.fn()
  } as any) as Database;
};
