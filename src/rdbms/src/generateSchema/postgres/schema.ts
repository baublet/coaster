export const schema = [
  `DROP SCHEMA IF EXISTS public CASCADE;`,
  `CREATE SCHEMA public;`,
  `CREATE TABLE public.users (
      id serial PRIMARY KEY,
      username text UNIQUE NOT NULL,
      password text NOT NULL,
      email text UNIQUE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `COMMENT ON TABLE public.users IS 'The users table';`,
  `DROP SCHEMA IF EXISTS accounts CASCADE;`,
  `CREATE SCHEMA accounts;`,
  `
    CREATE TABLE accounts.git_hub (
      id serial PRIMARY KEY,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      user_id integer NOT NULL REFERENCES public.users(id),
      github_id text UNIQUE NOT NULL
  );`,
  `COMMENT ON TABLE accounts.git_hub IS 'Connects GitHub accounts to user records';`,
];
