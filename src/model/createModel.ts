import { ModelHooks, NormalizedHooksMap } from "./hooks/hooks";
import { Validator, ValidateFn } from "./validate/validate";
import buildRelationships from "./buildRelationships";
import composeModel from "./composers";
import generateNames, { GeneratedNames } from "helpers/generateNames";
import normalizeHooks from "./hooks";
import { createFactory } from "./createFactory";
import { PersistQuery, PersistConnection } from "persist";

export type ModelComputedPropFn<T> = (data: T) => any;
export interface ModelDataDefaultType extends Record<string, any> {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
}
export type ModelData<T = ModelDataDefaultType> = T;

export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;
export type ModelOptionsComputedProps<T> = Record<string, ModelComputedType<T>>;

export type ModelManyRelationship = [Model];

export interface ModelInternalProperties {
  $changed: boolean;
  $computed: Record<string, ModelComputedPropFn<any>>;
  $data: ModelDataDefaultType;
  $deleted: boolean;
  $factory: ModelFactory<any>;
  $hooks: ModelHooks;
  $names: GeneratedNames;
  $relationships: Record<string, Model>;
  $setRelationship: (key: string, model: Model) => void;
  $validate: ValidateFn<any>;
  $validators: Validator<any>[];
}

export type Model<
  UserLandProperties = ModelDataDefaultType
> = UserLandProperties;

export interface ModelFactoryComposerArguments {
  composers: ModelFactoryComposerFunction[];
  has: (ModelFactory | ModelFactory[])[];
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

export interface ModelOptions<T, C> {
  composers?: ModelFactoryComposerFunction[];
  computedProps?: ModelOptionsComputedProps<T>;
  has?: (ModelFactory | ModelFactory[])[];
  hooks?: ModelOptionsHooks;
  name: string;
  validators?: Validator<T>[];
}
export type ModelOptionsWithPersist<T, C> = ModelOptions<T, C> & {
  databaseName?: string;
  persistWith: PersistConnection;
  tableName?: string;
};

export function isModelOptionsWithPersist<T, C>(
  v: any
): v is ModelOptionsWithPersist<T, C> {
  if (typeof v !== "object") return false;
  if (v.persistWith) return true;
  return false;
}

export type ModelFactoryFn<DataTypes, ComputedTypes> = (
  initialValue: DataTypes
) => Model<DataTypes & ComputedTypes>;

export type ModelFactory<
  DataTypes = ModelDataDefaultType,
  ComputedTypes = ModelDataDefaultType
> = ModelFactoryFn<DataTypes, ComputedTypes> & {
  isFactory: boolean;
  names: GeneratedNames;
  relationships: (ModelFactory | ModelFactory[])[];
};

export type ModelFactoryWithPersist<T, C> = ModelFactory<T, C> & {
  databaseName: string;
  save: () => boolean;
  tableName: string;
  query: PersistQuery<T, C>;
};

export function isModelFactory(v: any): v is ModelFactory {
  if (typeof v !== "function") return false;
  if (v.modelName && v.modelFactory) return true;
  return false;
}

export function isModel(v: any): v is Model {
  if (typeof v !== "object") return false;
  if (v instanceof Proxy === false) return false;
  if (v.$isModel) return true;
  return false;
}

export function many(model: ModelFactory): [ModelFactory] {
  return [model];
}

export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptions<T, C>
): ModelFactory<T, C>;
export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptionsWithPersist<T, C>
): ModelFactoryWithPersist<T, C>;
export function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>(
  args: ModelOptions<T, C> | ModelOptionsWithPersist<T, C>
): any {
  const {
    composers = [],
    computedProps = {},
    has = [],
    hooks = {},
    name,
    validators = []
  } = args;

  const names = generateNames(name);

  // Normalize hook nodes into arrays
  const normalizedHooks: NormalizedHooksMap = normalizeHooks(hooks);

  // Run our composers
  composeModel(names.canonical, composers, computedProps, has, validators);

  // Build out relationships object out of our `has` options
  const relationships = initialValue => buildRelationships(has, initialValue);

  let persistWith;
  let tableName;
  let databaseName;
  if (isModelOptionsWithPersist<T, C>(args)) {
    persistWith = args.persistWith;
    tableName = args.tableName || names.pluralSafe;
    databaseName = args.databaseName || "default";
  }

  // Build our factory
  return createFactory<T, C>({
    computedProps,
    databaseName,
    has,
    names,
    normalizedHooks,
    persistWith,
    relationships,
    tableName,
    validators
  });
}
