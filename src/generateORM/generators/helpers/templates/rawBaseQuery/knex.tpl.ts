import { Knex, knex } from "knex";
export type Connection = Knex<any, unknown[]>;
export type Transaction = Knex.Transaction<any, any>;
export type ConnectionOrTransaction = Connection | Transaction;
