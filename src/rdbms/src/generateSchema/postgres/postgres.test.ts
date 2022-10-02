import { execa } from "execa";
import { knex, Knex } from "knex";

import { afterAll, beforeAll, expect, it } from "@baublet/coaster-unit-test";
import { wait } from "@baublet/coaster-utils";

import { postgres } from "./postgres";

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
    await query("SELECT 1");
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

  await wait(1000);
  await waitForConnected(tries - 1);
}

beforeAll(async () => {
  await execa("docker-compose", ["up", "--detach"], {
    cwd: __dirname,
  });

  await waitForConnected(5);

  await query(`DROP SCHEMA IF EXISTS public CASCADE`);
  await query(`CREATE SCHEMA public`);
  await query(`
    CREATE TABLE public.users (
      id serial PRIMARY KEY,
      username text UNIQUE NOT NULL,
      password text NOT NULL,
      email text UNIQUE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    COMMENT ON TABLE public.users IS 'The users table';
    `);

  await query(`DROP SCHEMA IF EXISTS accounts CASCADE`);
  await query(`CREATE SCHEMA accounts`);
  await query(`
    CREATE TABLE accounts.git_hub (
      id serial PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id integer NOT NULL REFERENCES public.users(id),
      github_id text UNIQUE NOT NULL
    );
    COMMENT ON TABLE accounts.git_hub IS 'Connects GitHub accounts to user records';
`);
});

afterAll(async () => {
  // await execa("docker-compose", ["down"], {
  //   cwd: __dirname,
  // });
  await query(`DROP SCHEMA IF EXISTS public CASCADE`);
  await query(`DROP SCHEMA IF EXISTS test_schema CASCADE`);
});

it("passes the basics", async () => {
  await expect(postgres({ config: pgConfig })).resolves.toMatchInlineSnapshot(`
    {
      "tables": [
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
              "hasDefaultValue": false,
              "indexed": false,
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
              "indexed": false,
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
          "name": "users",
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
          "name": "accountsGitHub",
          "nameInDb": "\\"accounts\\".\\"git_hub\\"",
        },
      ],
    }
  `);
});
