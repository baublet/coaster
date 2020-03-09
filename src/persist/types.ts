import knex from "knex";
import {
  Model,
  ModelArgs,
  ModelFactoryArgsFromModelArgs,
  ModelHooks,
  ModelArgsPrimitivePropertyArgs,
  ObjectWithoutNeverProperties,
  ModelArgsPropertyType
} from "model/types";
import { GeneratedNames } from "helpers/generateNames";
import { ValidationErrors, ModelFieldValidator } from "validate";

export type PersistConnectArguments = string | knex.Config;
export type PersistConnection = knex;
export type PersistTransaction = knex.Transaction;
export type PersistQueryBuilder = knex.QueryBuilder;

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

export interface PersistedModelRelationshipPropertyArgs {
  type: ModelArgsPropertyType.RELATIONSHIP;
  /**
   * The model factory to relate this model to
   */
  modelFactory: PersistedModelFactory;
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
  /**
   * Persist connection to use for the bridge table between these two models
   */
  bridgeTablePersist?: PersistConnection;
  /**
   * Validation rules for this property
   */
  validate?: ModelFieldValidator[];
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
  bridgeTablePersist: PersistConnection;
  foreignKey: string;
  localKey: string;
  many: boolean;
  modelFactory: PersistedModelFactory<any>;
  required: boolean;
}

export type PersistedModel<Args extends PersistModelArgs = any> = Model & {
  readonly $factory: PersistedModelFactory<Args>;
  readonly $relationshipsLoaded: boolean;
};

export type PersistedModelFactory<
  Args extends PersistModelArgs = any
> = PersistRelationships<Args> & {
  (initialValue: ModelFactoryArgsFromModelArgs<Args>): PersistedModel<Args>;
  readonly $factory: PersistedModelFactory<Args>;
  readonly $options: Args & PersistModelArgs;
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
  readonly belongingTo: PersistBelongingToFunction;
  readonly count: PersistCountFunction;
  readonly create: PersistSaveFunction<Args>;
  readonly delete: PersistDeleteFunction<Args>;
  readonly find: PersistFindFunction<Args>;
  readonly findBy: PersistFindByFunction<Args>;
  readonly query: PersistQueryFunctionOnFactory<Args>;
  readonly update: PersistSaveFunction<Args>;

  /**
   * Validates the model. Returns a tuple. The first value is whether the model
   * is valid. The second value are validation errors.
   */
  readonly validate: (
    model: PersistedModel
  ) => [boolean, ValidationErrors<Args>];
};

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
   * Eagerly load model relationships. If "true", we load all of the related
   * objects. If "false", we eagerly load none. To load specific objects, pass
   * in an array of relationships to load.
   */
  eager?: boolean | string[];
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

export type PersistBelongingToFunction = (
  model: PersistedModel,
  options?: PersistFindQueryOptions
) => Promise<PersistedModel[]>;

export type PersistCountFunction = (
  persist?: PersistConnection
) => Promise<number>;

export type PersistRelationshipQueryOptions = Omit<
  PersistFindQueryOptions,
  "persist" | "eager"
>;

export type PersistModelFactoryRelationsipCreateFn<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = (
  on: PersistedModel<MainArgs>,
  model: ReturnType<ForeignFactory> | Partial<Parameters<ForeignFactory>>,
  validate?: boolean
) => Promise<ReturnType<ForeignFactory>>;

export type PersistModelFactoryRelationsipCreateManyFn<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = (
  on: PersistedModel<MainArgs>,
  model: (ReturnType<ForeignFactory> | Partial<Parameters<ForeignFactory>>)[],
  validate?: boolean
) => Promise<ReturnType<ForeignFactory>[]>;

export type PersistModelFactoryRelationsipDeleteFn<
  MainArgs extends PersistModelArgs
> = (on: PersistedModel<MainArgs>, id: string | string[]) => Promise<number>;

export type PersistModelFactoryRelationsipDeleteAllFn<
  MainArgs extends PersistModelArgs
> = (on: PersistedModel<MainArgs>) => Promise<number>;

export type PersistModelFactoryRelationsipFindFn<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = (
  on: PersistedModel<MainArgs>,
  options?: PersistRelationshipQueryOptions
) => Promise<ReturnType<ForeignFactory>[]>;

export type PersistWhereFunction = (
  where: PersistQueryBuilder
) => PersistQueryBuilder;

export type PersistModelFactoryRelationsipFindByFn<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = (
  on: PersistedModel<MainArgs>,
  by: Partial<ModelFactoryArgsFromModelArgs<MainArgs>>,
  options?: PersistRelationshipQueryOptions
) => Promise<ReturnType<ForeignFactory>[]>;

export type PersistModelFactoryRelationsipFindWhereFn<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = (
  on: PersistedModel<MainArgs>,
  where: PersistWhereFunction,
  options?: PersistRelationshipQueryOptions
) => Promise<ReturnType<ForeignFactory>[]>;

export type PersistRelationshipFunctions<
  MainArgs extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
> = {
  /**
   * Creates a relationship using either a created model or partial data. By
   * default, we validate the model before trying to create it and the link.
   * Resolves the newly-created model that's linked to `on`
   */
  create: PersistModelFactoryRelationsipCreateFn<MainArgs, ForeignFactory>;
  /**
   * Creates a relationship using either a created model or partial data. By
   * default, we validate the model before trying to create it and the link.
   * Resolves the newly-created model that's linked to `on`
   */
  createMany: PersistModelFactoryRelationsipCreateManyFn<
    MainArgs,
    ForeignFactory
  >;
  /**
   * Delete one or more relationship from a model. Resolves the number of models
   * deleted.
   */
  delete: PersistModelFactoryRelationsipDeleteFn<MainArgs>;
  /**
   * Deletes all models related to `on` along this accessor. Resolves the number
   * of deleted models.
   */
  deleteAll: PersistModelFactoryRelationsipDeleteAllFn<MainArgs>;
  /**
   * Resolves a number of models related to `on` along this accessor.
   */
  find: PersistModelFactoryRelationsipFindFn<MainArgs, ForeignFactory>;
  /**
   * Resolves a number of models related to `on` matching basic parameters
   */
  findBy: PersistModelFactoryRelationsipFindByFn<MainArgs, ForeignFactory>;
  /**
   * Resolves a number of models related to `on` matching the criteria via the
   * matcher parameters assigned via `where()`
   */
  findWhere: PersistModelFactoryRelationsipFindWhereFn<
    MainArgs,
    ForeignFactory
  >;
};

export type PersistRelationshipFilter<
  Args extends PersistedModelArgsPropertyArgs,
  MainArgs extends PersistModelArgs
> = Args extends PersistedModelRelationshipPropertyArgs
  ? PersistRelationshipFunctions<MainArgs, Args["modelFactory"]>
  : never;

export type PersistRelationships<Args extends PersistModelArgs = any> = {
  // We need this line here because it tells TS how to index this object. If we
  // don't have it, TS will complain that we might be giving it properties it
  // shouldn't have.
  [x: string]: any;
} & ObjectWithoutNeverProperties<
  {
    readonly [K in keyof Args["properties"]]: PersistRelationshipFilter<
      Args["properties"][K],
      Args
    >;
  }
>;

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
