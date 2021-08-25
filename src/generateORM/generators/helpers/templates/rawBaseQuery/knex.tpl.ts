import knex from "knex";
export type Connection = knex<any, unknown[]>;
export type Transaction = knex.Transaction<any, any>;
export type ConnectionOrTransaction = Connection | Transaction;
