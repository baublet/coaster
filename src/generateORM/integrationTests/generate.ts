import path from "path";
import fs from "fs";

import { generateORM } from "../generateORM";
import { pgSchemaFetcher, fetcherWithConfiguration } from "../drivers";
import {
  rawBaseQuery,
  rawTypes,
  typesWithNamingPolicy,
  typedCrud,
} from "../generators";

const outputFilePath = path.resolve(__dirname, "generated.ts");
const testOutputFilePath = path.resolve(
  __dirname,
  "generated.integration.test.ts"
);

if (fs.existsSync(outputFilePath)) {
  fs.unlinkSync(outputFilePath);
}

generateORM({
  connectionOptions: require("./knexfile.js"),
  fetcher: fetcherWithConfiguration(pgSchemaFetcher, {
    excludeTables: ["knex_*"],
  }),
  generators: [rawTypes, rawBaseQuery, typesWithNamingPolicy, typedCrud],
  postProcessors: [],
  generateTestCode: true,
}).then((generated) => {
  fs.writeFileSync(outputFilePath, generated.code);
  fs.writeFileSync(testOutputFilePath, generated.testCode);
});
