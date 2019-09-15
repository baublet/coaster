import { ModelHooks, NormalizedHooksMap } from "./hooks/hooks";
import { PersistAdapter } from "../persist";
import { Validator, ValidateFn } from "./validate/validate";
import buildRelationships from "./buildRelationships";
import composeModel from "./composers";
import generateNames, { GeneratedNames } from "helpers/generateNames";
import normalizeHooks from "./hooks";
import createFactory from "./createFactory";
import { Schema } from "persist/schema";
import get from "lodash.get";

export type ModelComputedPropFn<T> = (data: T) => any;
export interface ModelDataDefaultType extends Record<string, any> {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
}
export type ModelData<T = ModelDataDefaultType> = T;
export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;

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
export type ModelOptionsComputedProps<T> = Record<string, ModelComputedType<T>>;

export interface ModelOptions<T, C> {
  composers?: ModelFactoryComposerFunction[];
  computedProps?: ModelOptionsComputedProps<T>;
  databaseName?: string;
  has?: (ModelFactory | ModelFactory[])[];
  hooks?: ModelOptionsHooks;
  name: string;
  persistWith?: PersistAdapter;
  tableName?: string;
  validators?: Validator<T>[];
}

export type ModelFactoryFn<DataTypes, ComputedTypes> = (
  initialValue: DataTypes
) => Model<DataTypes & ComputedTypes>;

export type ModelFactory<
  DataTypes = ModelDataDefaultType,
  ComputedTypes = ModelDataDefaultType
> = ModelFactoryFn<DataTypes, ComputedTypes> & {
  databaseName: string;
  isFactory: boolean;
  names: GeneratedNames;
  schema: Schema | null;
  tableName: string;
};

export function isModelFactory(v: any): v is ModelFactory {
  if (typeof v !== "function") return false;
  if (v.modelName && v.modelFactory) return true;
  return false;
}

export function many(model: ModelFactory): [ModelFactory] {
  return [model];
}

function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>({
  composers = [],
  computedProps = {},
  databaseName,
  has = [],
  hooks = {},
  name,
  persistWith,
  tableName,
  validators = []
}: ModelOptions<T, C>): ModelFactory<T, C> {
  const names = generateNames(name);
  tableName = tableName || names.pluralSafe;

  // Normalize hook nodes into arrays
  const normalizedHooks: NormalizedHooksMap = normalizeHooks(hooks);

  // Run our composers
  composeModel(names.canonical, composers, computedProps, has, validators);

  // Build out relationships object out of our `has` options
  const relationships = buildRelationships(has);

  // Build our factory
  const schema = persistWith && get(persistWith, "schema", null);
  return createFactory<T, C>({
    computedProps,
    databaseName,
    names,
    normalizedHooks,
    persistWith,
    relationships,
    tableName,
    schema,
    validators
  });
}

export default createModel;
