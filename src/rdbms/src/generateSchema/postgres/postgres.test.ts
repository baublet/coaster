import { execa } from "execa";
import { knex, Knex } from "knex";

import { afterAll, beforeAll, expect, it } from "@baublet/coaster-unit-test";
import { wait } from "@baublet/coaster-utils";

import { postgres } from "./postgres";
import { schema } from "./schema";

const pgConfig: Knex.Config = {
  client: "postgres",
  connection: {
    host: "localhost",
    port: 5438,
    user: "postgres",
    password: "postgres",
  },
};

async function query<T>(query: string): Promise<T> {
  const connection = knex(pgConfig);
  const results = await connection.raw(query);
  return results.rows;
}

async function isConnected(): Promise<boolean> {
  try {
    await query("SELECT 1;");
    return true;
  } catch (error) {
    return false;
  }
}

async function waitForConnected(tries: number): Promise<void> {
  if (tries === 0) {
    throw new Error("Could not connect to postgres");
  }

  if (await isConnected()) {
    return;
  }

  await wait(500);
  await waitForConnected(tries - 1);
}

beforeAll(async () => {
  await execa("docker-compose", ["up", "--detach"], {
    cwd: __dirname,
  });

  await waitForConnected(10);

  for (const queryText of schema) {
    await query(queryText);
  }
});

afterAll(async () => {
  await execa("docker-compose", ["down"], {
    cwd: __dirname,
  });
});

it("passes the basics", async () => {
  await expect(postgres({ config: pgConfig })).resolves.toMatchInlineSnapshot(`
    {
      "tables": [
        {
          "columns": [
            {
              "hasDefaultValue": true,
              "indexed": true,
              "name": "id",
              "nameInDb": "\\"id\\"",
              "nullable": false,
              "type": "integer",
              "updatable": true,
              "valueType": "number",
            },
            {
              "hasDefaultValue": false,
              "indexed": true,
              "name": "username",
              "nameInDb": "\\"username\\"",
              "nullable": false,
              "type": "text",
              "updatable": true,
              "valueType": "string",
            },
            {
              "hasDefaultValue": false,
              "indexed": false,
              "name": "password",
              "nameInDb": "\\"password\\"",
              "nullable": false,
              "type": "text",
              "updatable": true,
              "valueType": "string",
            },
            {
              "hasDefaultValue": false,
              "indexed": true,
              "name": "email",
              "nameInDb": "\\"email\\"",
              "nullable": false,
              "type": "text",
              "updatable": true,
              "valueType": "string",
            },
            {
              "hasDefaultValue": true,
              "indexed": false,
              "name": "createdAt",
              "nameInDb": "\\"created_at\\"",
              "nullable": false,
              "type": "timestamp without time zone",
              "updatable": true,
              "valueType": "Date",
            },
            {
              "hasDefaultValue": true,
              "indexed": false,
              "name": "updatedAt",
              "nameInDb": "\\"updated_at\\"",
              "nullable": false,
              "type": "timestamp without time zone",
              "updatable": true,
              "valueType": "Date",
            },
          ],
          "comment": "The users table",
          "name": "Users",
          "nameInDb": "\\"public\\".\\"users\\"",
        },
        {
          "columns": [
            {
              "hasDefaultValue": true,
              "indexed": false,
              "name": "id",
              "nameInDb": "\\"id\\"",
              "nullable": false,
              "type": "integer",
              "updatable": true,
              "valueType": "number",
            },
            {
              "hasDefaultValue": true,
              "indexed": false,
              "name": "createdAt",
              "nameInDb": "\\"created_at\\"",
              "nullable": false,
              "type": "timestamp without time zone",
              "updatable": true,
              "valueType": "Date",
            },
            {
              "hasDefaultValue": true,
              "indexed": false,
              "name": "updatedAt",
              "nameInDb": "\\"updated_at\\"",
              "nullable": false,
              "type": "timestamp without time zone",
              "updatable": true,
              "valueType": "Date",
            },
            {
              "hasDefaultValue": false,
              "indexed": false,
              "name": "userId",
              "nameInDb": "\\"user_id\\"",
              "nullable": false,
              "type": "integer",
              "updatable": true,
              "valueType": "number",
            },
            {
              "hasDefaultValue": false,
              "indexed": false,
              "name": "githubId",
              "nameInDb": "\\"github_id\\"",
              "nullable": false,
              "type": "text",
              "updatable": true,
              "valueType": "string",
            },
          ],
          "comment": "Connects GitHub accounts to user records",
          "name": "AccountsGitHub",
          "nameInDb": "\\"accounts\\".\\"git_hub\\"",
        },
      ],
    }
  `);
});
