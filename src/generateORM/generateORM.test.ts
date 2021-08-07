/**
 * Generates code from soup-to-nuts and makes sure it spits out valid TypeScript
 */
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

import { generateORM } from "./generateORM";
import {
  baseQueryTypeScript,
  rawTypes,
  typesWithNamingPolicy,
} from "./generators";

import { getMockRawSchema } from "./mockRawSchema";

jest.setTimeout(20000);

const mockFetcher = () => [getMockRawSchema()];

it("returns a string", async () => {
  const generatedCode = await generateORM({
    connectionOptions: {
      client: "pg",
    },
    fetcher: mockFetcher,
    generators: [rawTypes, baseQueryTypeScript, typesWithNamingPolicy],
    postProcessors: [],
  });

  expect(typeof generatedCode).toEqual("string");
});

it("creates valid ts", async () => {
  const generatedCode = await generateORM({
    connectionOptions: {
      client: "pg",
    },
    fetcher: mockFetcher,
    generators: [rawTypes, baseQueryTypeScript, typesWithNamingPolicy],
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
          return reject(err);
        }
        if (stderr) {
          return reject(err);
        }
        resolve();
      }
    );
  });
});
