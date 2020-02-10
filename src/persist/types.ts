import knex from "knex";

import { ModelFactoryWithPersist, ModelDataPropTypes } from "model/types";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export type PersistQueryFunction = (
  knex: knex.QueryBuilder
) => knex.QueryBuilder;

export type PersistQueryFunctionOnFactory<T extends ModelDataPropTypes> = (
  queryFunction: PersistQueryFunction
) => Promise<ReturnType<ModelFactoryWithPersist<T>>[]>;

export type PersistDeleteFunction<T extends ModelDataPropTypes> = (
  modelOrId: ReturnType<ModelFactoryWithPersist<T>> | string,
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
export interface PersistFindFunction<T extends ModelDataPropTypes> {
  // The first signature is passing in a single ID, which returns Model | null
  (id: string, options?: PersistFindQueryOptions): Promise<ReturnType<
    ModelFactoryWithPersist<T>
  > | null>;
  // Second signature returns (Model | null)[]
  (ids: string[], options?: PersistFindQueryOptions): Promise<
    (ReturnType<ModelFactoryWithPersist<T>> | null)[]
  >;
}

export type PersistFindByFunction<T extends ModelDataPropTypes> = (
  by: Record<string, string | number | boolean>,
  options?: PersistFindQueryOptions
) => Promise<ReturnType<ModelFactoryWithPersist<T>>[]>;

export type PersistSaveFunction<T extends ModelDataPropTypes> = (
  model: ReturnType<ModelFactoryWithPersist<T>> | Partial<T>,
  trx?: PersistTransaction
) => Promise<ReturnType<ModelFactoryWithPersist<T>>>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;
