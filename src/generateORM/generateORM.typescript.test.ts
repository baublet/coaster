/**
 * Generates code from soup-to-nuts and makes sure it spits out valid TypeScript
 */
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

import { generateORM } from "./generateORM";
import {
  rawBaseQuery,
  rawTypes,
  typesWithNamingPolicy,
  typedCrud,
  Generator,
} from "./generators";

import { getMockRawSchema } from "./mockRawSchema";

// This test takes a while to run because it calls the TS type checker
jest.setTimeout(20000);

const mockFetcher = () => [getMockRawSchema()];

// Testing our ability to resolve async, nested generators
const customDummyGenerator: Generator = () => () =>
  Promise.resolve(() => () => ({ code: "", testCode: "" }));

it("returns a string", async () => {
  const generatedCode = await generateORM({
    connectionOptions: {
      client: "pg",
    },
    fetcher: mockFetcher,
    generators: [
      rawTypes,
      rawBaseQuery,
      typesWithNamingPolicy,
      customDummyGenerator,
    ],
    postProcessors: [],
  });

  expect(generatedCode).toEqual({
    code: expect.any(String),
    testCode: expect.any(String),
  });
});

it("creates valid ts: pg flavored", async () => {
  const fileName = `${Date.now()}.generateORM.ts`;
  const filePath = resolve(process.cwd(), "tmp", fileName);
  const testFileName = `${Date.now()}.generateORM.test.ts`;
  const testFilePath = resolve(process.cwd(), "tmp", testFileName);

  const generatedCode = await generateORM({
    connectionOptions: {
      client: "pg",
    },
    fetcher: mockFetcher,
    generators: [rawTypes, rawBaseQuery, typesWithNamingPolicy, typedCrud],
    postProcessors: [],
    generateTestCode: true,
    codeOutputFullPath: filePath.replace(".ts", ""),
  });

  writeFileSync(filePath, generatedCode.code);
  writeFileSync(testFilePath, generatedCode.testCode);

  await new Promise<void>((resolve, reject) => {
    exec(
      `node ./node_modules/typescript/bin/tsc ${filePath} ${testFilePath} --noEmit --esModuleInterop`,
      {
        cwd: process.cwd(),
        env: process.env,
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error("Unexpected error parsing TS: ", {
            stderr,
            stdout,
            message: err.message,
            error: err.stack,
          });
          return reject(err);
        }
        if (stderr) {
          console.error("Error parsing TS:", { stdout, stderr });
          return reject(err);
        }
        resolve();
      }
    );
  });
});
