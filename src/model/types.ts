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
  $nativeProperties: () => Record<string, any>;
  $relationships: Record<string, Model>;
  $setDeleted: (deleted: boolean) => void;
  $setRelationship: (key: string, model: Model) => void;
  $validate: ValidateFunction<any>;
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
  // Factory methods for persist. We have built-ins for this, but these allow
  // users to pass in whatever they want here in place of the built-ins.
  count?: PersistCountFunction;
  create?: PersistSaveFunction<T, C>;
  delete?: PersistDeleteFunction<T, C>;
  find?: PersistFindFunction<T, C>;
  findBy?: PersistFindByFunction<T, C>;
  query?: PersistQueryFunctionOnFactory<T, C>;
  update?: PersistSaveFunction<T, C>;
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
  count: PersistCountFunction;
  create: PersistSaveFunction<T, C>;
  databaseName: string;
  delete: PersistDeleteFunction<T, C>;
  find: PersistFindFunction<T, C>;
  findBy: PersistFindByFunction<T, C>;
  persistWith: PersistConnection;
  query: PersistQueryFunctionOnFactory<T, C>;
  tableName: string;
  update: PersistSaveFunction<T, C>;
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
