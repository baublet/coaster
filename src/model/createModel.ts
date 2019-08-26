import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import proxyModel from "./proxyModel";
import { Schema } from "./schema";

export type ModelComputedPropFn<T> = (data: T) => any;
export interface ModelDataDefaultType extends Record<string, any> {
  id?: string;
}
export type ModelData<T = ModelDataDefaultType> = T;
export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;

export interface ModelInternalProperties<Type> {
  $computed: Record<string, ModelComputedPropFn<Type>>;
  $data: ModelData<Type>;
  $name: string;
  $relationships: Record<string, Model>;
  $validate: ValidateFn<Type>;
  $validators: Validator<Type>[];
}

export type Model<UserLandProperties = ModelDataDefaultType> = UserLandProperties & ModelInternalProperties<UserLandProperties>;

export interface ModelOptions<T = ModelDataDefaultType> {
  name: string;
  validators?: Validator<T>[];
  computedProps?: Record<string, ModelComputedType<T>>;
  schema?: Schema;
}

export type ModelFactoryFn<DataTypes, ComputedTypes> = (
  initialValue: DataTypes
) => Model<DataTypes & ComputedTypes>;

export type ModelFactory<DataTypes = ModelDataDefaultType, ComputedTypes = ModelDataDefaultType> = ModelFactoryFn<
  DataTypes, ComputedTypes
> & {
  modelName: string;
  modelFactory: boolean;
  schema: Schema;
};

export function isModelFactory(v: any): v is ModelFactory {
  if (typeof v !== "function") return false;
  if (v.modelName && v.$$coasterModelFactory) return true;
  return false;
}

function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>({
  name,
  validators = [],
  computedProps = {},
  schema = {}
}: ModelOptions<T>): ModelFactory<T, C> {
  const factory = (initialValue: T = {} as T): Model<T & C> => {
    const model = proxyModel<T>({
      $computed: computedProps,
      $data: initialValue,
      $name: name,
      $relationships: {},
      $validate: validate,
      $validators: validators,
    });
    return model as Model<T & C>;
  };
  factory.modelName = name;
  factory.modelFactory = true;
  factory.schema = schema;
  return factory;
}

export default createModel;
