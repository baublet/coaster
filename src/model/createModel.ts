import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import proxyModel from "./proxyModel";
import { PersistAdapter } from "../persist";
import attachPersistFunctionsToModel from "./attachPersistFunctionsToModel";
import noPersistAdapterError from "./error/noPersistAdapterError";
import attachPersistFunctionsToModelFactory from "./attachPersistFunctionsToModelFactory";
import generateNames, { GeneratedNames } from "helpers/generateNames";

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
  $factory: ModelFactory<any>;
  $name: GeneratedNames;
  $relationships: Record<string, Model>;
  $setRelationship: (key: string, model: Model) => void;
  $validate: ValidateFn<any>;
  $validators: Validator<any>[];
}

export type Model<
  UserLandProperties = ModelDataDefaultType
> = UserLandProperties;

export interface ModelOptions<T = ModelDataDefaultType> {
  computedProps?: Record<string, ModelComputedType<T>>;
  has?: (ModelFactory | ModelFactory[])[];
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
  computedProps = {},
  has = [],
  name,
  persistWith,
  validators = []
}: ModelOptions<T>): ModelFactory<T, C> {
  const relationships = {};
  const names = generateNames(name);
  has.forEach((has: ModelFactory | [ModelFactory]) => {
    let name: string;
    if (Array.isArray(has)) {
      name = has[0].names.pluralSafe;
    } else {
      name = has.names.safe;
    }
    relationships[name] = Array.isArray(has) ? [] : null;
  });
  const factory = (initialValue: T = {} as T): Model<T & C> => {
    const $relationships = relationships;
    const baseModel = {
      $computed: computedProps,
      $data: initialValue,
      $names: names,
      $relationships,
      $validate: validate,
      $validators: validators,
      $factory: factory,
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
    return proxyModel(baseModel) as Model<T & C>;
  };
  factory.names = names;
  factory.isFactory = true;
  if (persistWith) {
    attachPersistFunctionsToModelFactory(factory, persistWith);
  }
  return factory;
}

export default createModel;
