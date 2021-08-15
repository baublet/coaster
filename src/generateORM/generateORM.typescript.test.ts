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
  Promise.resolve(() => () => "");

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

  expect(typeof generatedCode).toEqual("string");
});

it("creates valid ts: pg flavored", async () => {
  const generatedCode = await generateORM({
    connectionOptions: {
      client: "pg",
    },
    fetcher: mockFetcher,
    generators: [rawTypes, rawBaseQuery, typesWithNamingPolicy, typedCrud],
    postProcessors: [],
  });

  const fileName = `${Date.now()}.generateORM.test.ts`;
  const filePath = resolve(process.cwd(), "tmp", fileName);
  writeFileSync(filePath, generatedCode);

  await new Promise<void>((resolve, reject) => {
    exec(
      `node ./node_modules/typescript/bin/tsc ${filePath} --noEmit --esModuleInterop`,
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
