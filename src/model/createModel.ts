import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";
import createComputedPropFunctions, {
  ComputedPropClosedFn
} from "./createComputedPropFunctions";

export type ModelDataDefaultType = Record<string, any>;
export type ModelData<T = ModelDataDefaultType> = T;
export type ModelComputedType<T = ModelDataDefaultType> = (data: T) => any;

export interface Model<T = ModelDataDefaultType> {
  data: ModelData<T>;
  computed: Record<string, ComputedPropClosedFn<T>>;
  validate: ValidateFn<T>;
}

export interface ModelOptions<T = ModelDataDefaultType> {
  name: string;
  validators?: Validator<T>[];
  computedProps?: Record<string, ModelComputedType<T>>;
}

type ModelFactory<T = ModelDataDefaultType> = (initialValue: T) => Model<T>;

function createModel<T = ModelDataDefaultType>({
  name,
  validators = [],
  computedProps = {}
}: ModelOptions<T>): ModelFactory<T> {
  return (initialValue = {} as T) => {
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
}

export default createModel;
