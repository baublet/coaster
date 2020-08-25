import knex from "knex";

export type Connection = knex<any, unknown[]>;
export type QueryBuilder<T = any> = knex.QueryBuilder<T, unknown[]>;
export type Transaction<T = any> = knex.Transaction<T, any>;
export type ColumnBuilder = knex.ColumnBuilder;
export type RelationalDiscriminator<T = any> = (
  qb: QueryBuilder<T>
) => QueryBuilder<T>;

export function isConnection(value: any): value is Connection {
  if (typeof value !== "object") return false;
  if ("__knex__" in value) {
    return true;
  }
  return false;
}
