import { ModelHooks } from "./hooks";
import { GeneratedNames } from "helpers/generateNames";
import { ValidateFunction, Validator } from "./validate";
import {
  PersistSaveFunction,
  PersistDeleteFunction,
  PersistFindFunction,
  PersistFindByFunction,
  PersistQueryFunctionOnFactory,
  PersistConnection,
  PersistCountFunction
} from "persist/types";

export type ModelComputedPropFn<T> = (data: T) => any;
export type ModelDataPropTypes = Record<string, any>;
export type ModelDataDefaultType = Record<string, any>;
export type ModelData<T = ModelDataDefaultType> = T;

export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;
export type ModelOptionsComputedProps<T> = Record<string, ModelComputedType<T>>;
export type ModelInferredComputedProps<T> = Record<string, () => Model<T>>;

export type ModelManyRelationship = [Model];

export interface ModelInternalProperties {
  $changed: boolean;
  $computed: Record<string, ModelComputedPropFn<any>>;
  $data: ModelDataDefaultType;
  $deleted: boolean;
  $factory: ModelFactory<any>;
  $hooks: ModelHooks;
  $names: GeneratedNames;
  $nativeProperties: () => Record<string, any>;
  $relationships: Record<string, Model>;
  $setDeleted: (deleted: boolean) => void;
  $setRelationship: (key: string, model: Model) => void;
  $validate: ValidateFunction<any>;
  $validators: Validator<any>[];
}

export type Model<T = ModelDataDefaultType> = T & {
  // Only very rarely add these. We typically want to store these things at the
  // factory-level to prevent newing up functions and closures so often.
  toJson: () => Record<string, any>;
};

export interface ModelFactoryComposerArguments {
  composers: ModelFactoryComposerFunction[];
  has: ModelRelationshipArguments;
  computedProps: Record<string, ModelComputedType>;
  validators?: Validator[];
}

export type ModelFactoryComposer = (
  composerOptions: any
) => ModelFactoryComposerFunction;

export type ModelFactoryComposerFunction = (
  composerArguments: ModelFactoryComposerArguments
) => void;

export type ModelOptionsHookFunction = (args: any) => void;
export type ModelOptionsHooks = Record<
  string,
  ModelOptionsHookFunction | ModelOptionsHookFunction[]
>;

export interface ModelHasArguments {
  /**
   * When accessing this relationship, you can set a custom accessor. Instead
   * of `user.todos`, you can set this to `shoppingList` to access relationships
   * via `user.shoppingList`.
   */
  accessName?: string;
  /**
   * Also colloquially called "through". If you provide a "through" model,
   * we use that instead.
   */
  bridgeTableName?: string;
  /**
   * When searching for this model's relationships, we look for them on this
   * column.
   */
  foreignKey?: string;
  /**
   * When searching across the above column for relationships, this is the
   * column on this model we look for in the bridge table.
   */
  localKey?: string;
  /**
   * If this relationship can contain multiples, make this true. Defaults to
   * false.
   */
  many?: boolean;
  /**
   * Factory of the foreign model we're relating this model to.
   */
  model: ModelFactory;
  /**
   * Sometimes you want direct control over your relationships as models
   * themselves. For example, Doctors may have Patients through a separate
   * Appointments model.
   */
  through?: ModelFactoryWithPersist;
}

export function isModelHasArguments(arg: any): arg is ModelHasArguments {
  if (typeof arg !== "object") return false;
  if (Array.isArray(arg)) return false;
  if (isModel(arg)) return false;
  if (arg.model) return true;
  return false;
}

export type ModelRelationshipArguments = (
  | ModelFactory
  | ModelFactory[]
  | ModelHasArguments
)[];

export interface ModelOptions<T> {
  composers?: ModelFactoryComposerFunction[];
  computedProps?: ModelOptionsComputedProps<T>;
  has?: ModelRelationshipArguments;
  hooks?: ModelOptionsHooks;
  name: string;
  validators?: Validator<T>[];
}

export type ModelOptionsWithPersist<
  T extends ModelDataPropTypes
> = ModelOptions<T> & {
  databaseName?: string;
  persistWith: PersistConnection;
  primaryKey?: string;
  tableName?: string;
  // Factory methods for persist. We have built-ins for this, but these allow
  // users to pass in whatever they want here in place of the built-ins.
  count?: PersistCountFunction;
  create?: PersistSaveFunction<T>;
  delete?: PersistDeleteFunction<T>;
  find?: PersistFindFunction<T>;
  findBy?: PersistFindByFunction<T>;
  query?: PersistQueryFunctionOnFactory<T>;
  update?: PersistSaveFunction<T>;
};

export function isModelOptionsWithPersist<T>(
  v: any
): v is ModelOptionsWithPersist<T> {
  if (typeof v !== "object") return false;
  if (v.persistWith) return true;
  return false;
}

export type ModelFactoryFn<T> = (
  // Allows partial initialization of models, and doesn't let
  // users accidentally set computedProps when initializing
  initialValue: Partial<T>
) => Model<T>;

export type ModelFactory<T extends ModelDataPropTypes = {}> = ModelFactoryFn<
  T
> & {
  $id: Symbol;
  isFactory: boolean;
  names: GeneratedNames;
  relationships: ModelRelationshipArguments;
};

export type ModelFactoryWithPersist<
  T extends ModelDataPropTypes = {}
> = ModelFactory<T> & {
  count: PersistCountFunction;
  create: PersistSaveFunction<T>;
  databaseName: string;
  delete: PersistDeleteFunction<T>;
  find: PersistFindFunction<T>;
  findBy: PersistFindByFunction<T>;
  persistWith: PersistConnection;
  primaryKey: string;
  query: PersistQueryFunctionOnFactory<T>;
  tableName: string;
  update: PersistSaveFunction<T>;
};

export function isModelFactory(v: any): v is ModelFactory {
  if (typeof v !== "function") return false;
  if (v.modelName && v.modelFactory) return true;
  return false;
}

export function isModel(v: any): v is Model {
  if (typeof v !== "object") return false;
  if (v.$isModel) return true;
  return false;
}
