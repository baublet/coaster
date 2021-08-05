import knex from "knex";

export type DatabaseConnection<
  TRecord extends {} = {},
  TResult extends any[] = unknown[]
> = knex<TRecord, TResult>;

export type QueryBuilder<
  TRecord extends {} = {},
  TResult extends any[] = unknown[]
> = knex.QueryBuilder<TRecord, TResult>;