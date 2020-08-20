import knex from "knex";

export type Connection = knex<any, unknown[]>;
export type QueryBuilder<T = any> = knex.QueryBuilder<T, unknown[]>;
export type Transaction<T = any> = knex.Transaction<T, any>;
export type ColumnBuilder = knex.ColumnBuilder;
export type ConstrainerFunction<T = any> = (
  qb: QueryBuilder<T>
) => QueryBuilder<T>;
