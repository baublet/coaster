import knex from "knex";
import {
  ModelFactory,
  Model,
  ModelArgs,
  ModelFactoryArgsFromModelArgs,
  ModelHooks,
  ModelArgsRelationshipPropertyArgs,
  ModelArgsPrimitivePropertyArgs
} from "model/types";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export type PersistGenericHookFunction = (model: Model) => void;
export type PersistDeleteHookFunction = (modelOrId: Model | string) => void;

/**
 * Persist-related hooks
 */
export interface PersistModelHooks {
  /**
   * Fires before we save the model to the database
   */
  beforeCreate?: PersistGenericHookFunction[];
  /**
   * Fires after we save the model to the database
   */
  afterCreate?: PersistGenericHookFunction[];
  /**
   * Fires right before we update the model to the database
   */
  beforeUpdate?: PersistGenericHookFunction[];
  /**
   * Fires right after we update the model to the database
   */
  afterUpdate?: PersistGenericHookFunction[];
  /**
   * Fires right before we delete the model from the database
   */
  beforeDelete?: PersistDeleteHookFunction[];
  /**
   * Fires right after we delete the model from the database
   */
  afterDelete?: PersistDeleteHookFunction[];
}

export interface PersistedModelRelationshipPropertyArgs
  extends ModelArgsRelationshipPropertyArgs {
  /**
   * The name of the table where we correlated the models.
   */
  bridgeTableName?: string;
  /**
   * The key in the bridge table that references the current model
   */
  localKey?: string;
  /**
   * The key in the bridge table that relates to the model declared in modelFactory
   */
  foreignKey?: string;
}

export type PersistedModelArgsPropertyArgs =
  | PersistedModelRelationshipPropertyArgs
  | ModelArgsPrimitivePropertyArgs;

export interface PersistModelArgs extends ModelArgs {
  properties: Record<string, PersistedModelArgsPropertyArgs>;
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
  /**
   * Persist-related hooks
   */
  hooks?: ModelHooks & PersistModelHooks;
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
  modelFactory: PersistedModelFactory<any>;
  required: boolean;
}

export interface PersistedModelFactory<Args extends PersistModelArgs>
  extends ModelFactory<Args> {
  readonly $factory: PersistedModelFactory<Args>;
  readonly $options: Args & PersistModelArgs;
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

export function isPersistedModel(model: Model): model is Model {
  return Boolean(
    (model?.$factory?.$options as PersistModelArgs)?.persist?.with
  );
}
