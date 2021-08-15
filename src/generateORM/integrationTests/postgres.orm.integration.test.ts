import knex from "knex";
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

// This is generated after the first test
// @ts-expect-error
import { RawUsers } from "./generated";

const connection = knex(require("./knexfile.js"));
const outputFilePath = path.join(__dirname, "generated.ts");

beforeAll(() => {
  if (fs.existsSync(outputFilePath)) {
    fs.unlinkSync(outputFilePath);
  }
});

afterAll(async () => {
  await connection.destroy();
});

it("generates the ORM", async () => {
  const generated = await generateORM({
    connectionOptions: require("./knexfile.js"),
    fetcher: fetcherWithConfiguration(pgSchemaFetcher, {
      excludeTables: ["knex_*"],
    }),
    generators: [rawTypes, rawBaseQuery, typesWithNamingPolicy, typedCrud],
    postProcessors: [],
  });
  fs.writeFileSync(outputFilePath, generated);
});

describe("Raw DB query driver", () => {
  const testUserId = Date.now().toString();

  it("inserts a user", async () => {
    const created = await RawUsers(connection)
      .insert({ id: testUserId })
      .returning("*");
    await expect(created).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });

  it("reads a user", async () => {
    const created = await RawUsers(connection)
      .select("*")
      .where({ id: testUserId });
    await expect(created).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });

  it("updates a user", async () => {
    await RawUsers(connection)
      .where("id", "=", testUserId)
      .update({ id: testUserId + "yo" });

    const updated = await RawUsers(connection)
      .select("*")
      .where("id", "=", testUserId + "yo");

    await expect(updated).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId + "yo",
        updated_at: expect.any(Date),
      },
    ]);

    await expect(
      RawUsers(connection)
        .where("id", "=", testUserId + "yo")
        .update({ id: testUserId })
        .returning("*")
    ).resolves.toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });
});
