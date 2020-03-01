import knex from "knex";
import {
  ModelArgs,
  ModelFactory,
  Model,
  ModelBaseArgs,
  ModelFactoryArgsFromModelArgs
} from "model/types";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export interface PersistModelArgs extends ModelBaseArgs {
  persist: {
    /**
     * Persistence database connection to use
     */
    with: PersistConnection;
    /**
     * Table name name of the model. The default is a database-safe version of
     * the model name
     */
    tableName?: string;
    /**
     * Primary index key of the model. Default is "id"
     */
    primaryKey?: string;
  };
}

/**
 * Used for internal mapping
 */
export interface PersistModelRelationship {
  accessor: string;
  bridgeTableName: string;
  foreignKey: string;
  localKey: string;
  many: boolean;
  modelFactory: PersistedModelFactory;
  required: boolean;
}

export interface VanillaModelArgs extends ModelBaseArgs {
  $options;
}

export interface PersistedModelFactory<Args extends PersistModelArgs = any>
  extends ModelFactory<Args> {
  readonly $options: Args;
  readonly $relationships: PersistModelRelationship[];
  readonly find: PersistFindFunction<Args>;
  readonly findBy: PersistFindByFunction<Args>;
  readonly delete: PersistDeleteFunction<Args>;
  readonly create: PersistSaveFunction<Args>;
  readonly update: PersistSaveFunction<Args>;
  readonly count: PersistCountFunction;
  readonly query: PersistQueryFunctionOnFactory<Args>;
}

export type PersistQueryFunction = (
  knex: knex.QueryBuilder
) => knex.QueryBuilder;

export type PersistQueryFunctionOnFactory<T extends ModelArgs> = (
  queryFunction: PersistQueryFunction
) => Promise<Model<T>[]>;

export type PersistDeleteFunction<T extends ModelArgs> = (
  modelOrId: Model<T> | string,
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
export interface PersistFindFunction<T extends ModelArgs> {
  // The first signature is passing in a single ID, which returns Model | null
  (id: string, options?: PersistFindQueryOptions): Promise<Model<T> | null>;
  // Second signature returns (Model | null)[]
  (ids: string[], options?: PersistFindQueryOptions): Promise<
    (Model<T> | null)[]
  >;
}

export type PersistFindByFunction<T extends ModelArgs> = (
  by: Partial<ModelFactoryArgsFromModelArgs<T>>,
  options?: PersistFindQueryOptions
) => Promise<Model<T>[]>;

export type PersistSaveFunction<T extends ModelArgs> = (
  model: Model<T> | ModelFactoryArgsFromModelArgs<T>,
  trx?: PersistTransaction
) => Promise<Model<T>>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;

export function isPersistArgs(args: unknown): args is PersistModelArgs {
  if (typeof args !== "object") return false;
  if ("persist" in args) return true;
  return false;
}
