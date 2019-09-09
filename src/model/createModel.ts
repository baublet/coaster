import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import proxyModel from "./proxyModel";
import { PersistAdapter } from "../persist";
import attachPersistFunctionsToModel from "./attachPersistFunctionsToModel";
import noPersistAdapterError from "./error/noPersistAdapterError";
import attachPersistFunctionsToModelFactory from "./attachPersistFunctionsToModelFactory";
import generateNames, { GeneratedNames } from "helpers/generateNames";
import proxyModelArray from "./proxyModelArray";
import { ModelHooks, hookDefaults } from "./hooks";

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

type ModelOptionsHookFunction = (args: any) => void;
type NormalizedHooksMap = Record<string, ((args: any) => void)[]>;

export interface ModelOptions<T = ModelDataDefaultType> {
  composers?: ModelFactoryComposerFunction[];
  computedProps?: Record<string, ModelComputedType<T>>;
  has?: (ModelFactory | ModelFactory[])[];
  hooks?: Record<string, ModelOptionsHookFunction | ModelOptionsHookFunction[]>;
  name: string;
  persistWith?: PersistAdapter;
  validators?: Validator<T>[];
}

export type ModelFactoryFn<DataTypes, ComputedTypes> = (
  initialValue: DataTypes
) => Model<DataTypes & ComputedTypes>;

export type ModelFactory<
  DataTypes = ModelDataDefaultType,
  ComputedTypes = ModelDataDefaultType
> = ModelFactoryFn<DataTypes, ComputedTypes> & {
  names: GeneratedNames;
  isFactory: boolean;
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
  has = [],
  hooks = hookDefaults(),
  name,
  persistWith,
  validators = []
}: ModelOptions<T>): ModelFactory<T, C> {
  // Normalize hook nodes into arrays
  const normalizedHooks: NormalizedHooksMap = Object.assign(
    {},
    hookDefaults(),
    hooks
  );
  Object.keys(normalizedHooks).forEach(key => {
    const hookNode = normalizedHooks[key];
    if (Array.isArray(hookNode)) return;
    if (typeof hookNode !== "function") {
      return (normalizedHooks[key] = []);
    } else {
      normalizedHooks[key] = [hookNode];
    }
  });

  composers.forEach(composer => {
    composer({
      computedProps,
      has,
      validators
    });
  });
  const relationships = {};
  const names = generateNames(name);
  has.forEach((has: ModelFactory | [ModelFactory]) => {
    let name: string;
    if (Array.isArray(has)) {
      name = has[0].names.pluralSafe;
    } else {
      name = has.names.safe;
    }
    relationships[name] = Array.isArray(has) ? proxyModelArray([]) : null;
  });
  const factory = (initialValue: T = {} as T): Model<T & C> => {
    normalizedHooks.beforeCreate.forEach(hook =>
      hook({ initialData: initialValue })
    );
    const baseModel = {
      $changed: false,
      $computed: computedProps,
      $data: initialValue,
      $deleted: false,
      $factory: factory,
      $hooks: normalizedHooks,
      $names: names,
      $relationships: relationships,
      $validate: validate,
      $validators: validators,
      reload: async () => {
        throw noPersistAdapterError(name);
      },
      save: async () => {
        throw noPersistAdapterError(name);
      },
      delete: async () => {
        throw noPersistAdapterError(name);
      }
    };
    if (persistWith) {
      attachPersistFunctionsToModel(baseModel, persistWith);
    }
    const model = proxyModel(baseModel) as Model<T & C>;
    normalizedHooks.afterCreate.forEach(hook => {
      hook({ model });
    });
    return model;
  };
  factory.names = names;
  factory.isFactory = true;
  if (persistWith) {
    attachPersistFunctionsToModelFactory(factory, persistWith);
  }
  return factory;
}

export default createModel;
