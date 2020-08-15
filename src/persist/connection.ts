import knex from "knex";

export type Connection = knex<any, unknown[]>;
export type QueryBuilder = knex.QueryBuilder<any, unknown[]>;
export type Transaction = knex.Transaction<any, any>;
export type ColumnBuilder = knex.ColumnBuilder;
