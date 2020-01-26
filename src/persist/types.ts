import knex from "knex";
import { Model } from "model/types";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export type PersistQueryFunction = (
  knex: knex.QueryBuilder
) => knex.QueryBuilder;

export type PersistQueryFunctionOnFactory<T, C> = (
  queryFunction: PersistQueryFunction
) => Promise<Model<T & C>[]>;

export type PersistDeleteFunction<T, C> = (
  model: Model<T & C> | string,
  persist?: PersistConnection
) => Promise<boolean>;

export type PersistFindFunction<T, C> = (
  id: string,
  columns?: string[],
  persist?: PersistConnection
) => Promise<Model<T & C> | null>;

export type PersistFindByFunction<T, C> = (
  by: Record<string, string | number | boolean>,
  columns?: string[],
  persist?: PersistConnection
) => Promise<Model<T & C> | null>;

export type PersistSaveFunction<T, C> = (
  model: Model<T & C>,
  persist?: PersistConnection
) => Promise<Model<T & C>>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;
