import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import createComputedPropFunctions, {
  ComputedPropClosedFn
} from "./createComputedPropFunctions";

export interface ModelDataDefaultType extends Record<string, any> {
  id?: string;
}
export type ModelData<T = ModelDataDefaultType> = T;
export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;

export interface Model<T = ModelDataDefaultType> {
  name: string;
  data: ModelData<T>;
  computed: Record<string, ComputedPropClosedFn<T>>;
  validate: ValidateFn<T>;
}

export interface ModelOptions<T = ModelDataDefaultType> {
  name: string;
  validators?: Validator<T>[];
  computedProps?: Record<string, ModelComputedType<T>>;
}

export type ModelFactoryFn<T> = (initialValue: T) => Model<T>;

export type ModelFactory<T = ModelDataDefaultType> = ModelFactoryFn<T> & {
  modelName: string;
};

function createModel<T = ModelDataDefaultType>({
  name,
  validators = [],
  computedProps = {}
}: ModelOptions<T>): ModelFactory<T> {
  const factory = (initialValue = {} as T) => {
    const model = {
      name,
      validate,
      validators,
      data: initialValue,
      computed: {}
    };
    model.computed = createComputedPropFunctions<T>(model, computedProps);
    return model as Model<T>;
  };
  factory.modelName = name;
  return factory;
}

export default createModel;
