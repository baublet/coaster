import knex from "knex";

import { pgSchemaFetcher } from "./postgres";

const connection = knex(require("./knexfile.js"));

afterAll(async () => {
  await connection.destroy();
});

it("returns a schema in the right shape", async () => {
  await expect(pgSchemaFetcher(connection)).resolves.toMatchSnapshot();
});

it("excludes things when asked", async () => {
  await expect(
    pgSchemaFetcher(connection, {
      excludeTables: ["knex_*"],
    })
  ).resolves.toMatchSnapshot();
});
