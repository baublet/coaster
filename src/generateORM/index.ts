import { Knex, knex } from "knex";

export type Database = Knex;
export const db = knex;

export type DatabaseConnection<
  TRecord extends {} = {},
  TResult extends any[] = unknown[]
> = Knex<TRecord, TResult>;

export type QueryBuilder<
  TRecord extends {} = {},
  TResult extends any[] = unknown[]
> = Knex.QueryBuilder<TRecord, TResult>;

export type ConnectionOptions = Knex.Config;
