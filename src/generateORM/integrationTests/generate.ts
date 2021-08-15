import path from "path";
import fs from "fs";

import { generateORM } from "../generateORM";
import { pgSchemaFetcher, fetcherWithConfiguration } from "../drivers";
import {
  rawBaseQuery,
  rawTypes,
  typedCrud,
  typesWithNamingPolicy,
} from "../generators";

const outputFilePath = path.join(__dirname, "generated.ts");

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
}).then((generated) => {
  fs.writeFileSync(outputFilePath, generated);
});
