import knex from "knex";

import { PersistedModelFactory } from "model/types";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export type PersistQueryFunction = (
  knex: knex.QueryBuilder
) => knex.QueryBuilder;

export type PersistQueryFunctionOnFactory<T extends PersistedModelFactory> = (
  queryFunction: PersistQueryFunction
) => Promise<ReturnType<T>[]>;

export type PersistDeleteFunction<T extends PersistedModelFactory> = (
  modelOrId: ReturnType<T> | string,
  persist?: PersistConnection
) => Promise<boolean>;

export interface PersistFindQueryOptions {
  columns?: string[];
  /**
   * Eagerly load model relationships. If "true", we load the relationships on
   * on the first level, the equivalent of passing in 1. If you need deeper
   * depths, you may pass it in here as a number.
   */
  eager?: boolean | number;
  limit?: number;
  offset?: number;
  order?: { by: string; direction?: "asc" | "desc" }[];
  persist?: PersistConnection;
}

// This is an overloaded interface, that's why it looks funky
export interface PersistFindFunction<T extends PersistedModelFactory> {
  // The first signature is passing in a single ID, which returns Model | null
  (id: string, options?: PersistFindQueryOptions): Promise<ReturnType<
    T
  > | null>;
  // Second signature returns (Model | null)[]
  (ids: string[], options?: PersistFindQueryOptions): Promise<
    (ReturnType<T> | null)[]
  >;
}

export type PersistFindByFunction<T extends PersistedModelFactory> = (
  by: Record<string, string | number | boolean>,
  options?: PersistFindQueryOptions
) => Promise<ReturnType<T>[]>;

export type PersistSaveFunction<T extends PersistedModelFactory> = (
  model: ReturnType<T> | Partial<T>,
  trx?: PersistTransaction
) => Promise<ReturnType<T>>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;
