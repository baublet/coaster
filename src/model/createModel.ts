import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import proxyModel from "./proxyModel";

export type ModelComputedPropFn<T> = (data: T) => any;
export interface ModelDataDefaultType extends Record<string, any> {
  id?: string;
}
export type ModelData<T = ModelDataDefaultType> = T;
export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;

export interface ModelInternalProperties<Type> {
  $name: string;
  $data: ModelData<Type>;
  $computed: Record<string, ModelComputedPropFn<Type>>;
  $validate: ValidateFn<Type>;
  $validators: Validator<Type>[];
}

export type Model<UserLandProperties = ModelDataDefaultType> = UserLandProperties & ModelInternalProperties<UserLandProperties>;

export interface ModelOptions<T = ModelDataDefaultType> {
  name: string;
  validators?: Validator<T>[];
  computedProps?: Record<string, ModelComputedType<T>>;
}

export type ModelFactoryFn<DataTypes, ComputedTypes> = (
  initialValue: DataTypes
) => Model<DataTypes & ComputedTypes>;

export type ModelFactory<DataTypes = ModelDataDefaultType, ComputedTypes = ModelDataDefaultType> = ModelFactoryFn<
  DataTypes, ComputedTypes
> & {
  modelName: string;
  modelFactory: boolean;
};

export function isModelFactory(v: any): v is ModelFactory {
  if (typeof v !== "function") return false;
  if (v.modelName && v.$$coasterModelFactory) return true;
  return false;
}

function createModel<T = ModelDataDefaultType, C = ModelDataDefaultType>({
  name,
  validators = [],
  computedProps = {}
}: ModelOptions<T>): ModelFactory<T, C> {
  const factory = (initialValue: T = {} as T): Model<T & C> => {
    const model = proxyModel<T>({
      $name: name,
      $validate: validate,
      $validators: validators,
      $data: initialValue,
      $computed: computedProps
    });
    return model as Model<T & C>;
  };
  factory.modelName = name;
  factory.modelFactory = true;
  return factory;
}

export default createModel;
