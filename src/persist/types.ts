import knex from "knex";
import {
  Model,
  ModelArgs,
  ModelFactoryArgsFromModelArgs,
  ModelHooks,
  ModelArgsRelationshipPropertyArgs,
  ModelArgsPrimitivePropertyArgs
} from "model/types";
import { GeneratedNames } from "helpers/generateNames";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;

export type PersistGenericHookFunction = (model: PersistedModel) => void;
export type PersistDeleteHookFunction = (
  modelOrId: PersistedModel | string
) => void;

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

export interface PersistedModel<Args extends PersistModelArgs = any>
  extends Model {
  readonly $factory: PersistedModelFactory<Args>;
  readonly $relationshipsLoaded: boolean;
}

export interface PersistedModelFactory<Args extends PersistModelArgs = any> {
  (initialValue: ModelFactoryArgsFromModelArgs<Args>): PersistedModel<Args>;
  readonly $factory: PersistedModelFactory<Args>;
  readonly $options: Args & PersistModelArgs;

  (initialValue: ModelFactoryArgsFromModelArgs<Args>): Model<Args>;
  readonly $id: Symbol;
  /**
   * Returns the primitive data for the model
   */
  readonly $data: (model: PersistedModel<Args>) => Record<string, any>;
  readonly $name: string;
  readonly $names: GeneratedNames;
  /**
   * Clones a model
   * @param model
   */
  readonly clone: (model: PersistedModel<Args>) => PersistedModel<Args>;
  /**
   * Renders the model to JSON.
   * @param model
   * @param maxDepth - Max levels to render to JSON. Default is 5.
   */
  readonly toJson: (
    model: Model<Args>,
    maxDepth?: number,
    currentDepth?: number
  ) => Record<string, any>;

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

export type PersistQueryFunctionOnFactory<T extends PersistModelArgs> = (
  queryFunction: PersistQueryFunction
) => Promise<PersistedModel<T>[]>;

export type PersistDeleteFunction<T extends PersistModelArgs> = (
  modelOrId: PersistedModel<T> | string,
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
export interface PersistFindFunction<T extends PersistModelArgs> {
  // The first signature is passing in a single ID, which returns Model | null
  (id: string, options?: PersistFindQueryOptions): Promise<PersistedModel<
    T
  > | null>;
  // Second signature returns (Model | null)[]
  (ids: string[], options?: PersistFindQueryOptions): Promise<
    (PersistedModel<T> | null)[]
  >;
}

export type PersistFindByFunction<T extends PersistModelArgs> = (
  by: Partial<ModelFactoryArgsFromModelArgs<T>>,
  options?: PersistFindQueryOptions
) => Promise<PersistedModel<T>[]>;

export type PersistSaveFunction<T extends PersistModelArgs> = (
  model: PersistedModel<T> | ModelFactoryArgsFromModelArgs<T>,
  trx?: PersistTransaction
) => Promise<PersistedModel<T>>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;

export function isPersistArgs(args: unknown): args is PersistModelArgs {
  if (typeof args !== "object") return false;
  if ("persist" in args) return true;
  return false;
}

export function isPersistedModel(model: unknown): model is PersistedModel {
  if (typeof model !== "object") return false;
  if ((model as any)?.$factory?.$options?.persist) return true;
  return false;
}
