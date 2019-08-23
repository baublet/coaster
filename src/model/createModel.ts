import { Validator, ValidateFn } from "./validate/validate";
import validate from "./validate";

export type ModelData<T> = T;
export type ModelComputedType<T> = (data: T) => any;

export interface Model<T> {
  data: ModelData<T>;
  computed: Record<string, ModelComputedType<T>>;
  validate: ValidateFn<T>;
}

export interface ModelOptions<T> {
  name: string;
  validators: Validator<T>[];
  computedProps: Record<string, ModelComputedType<T>>;
}

type ModelFactory<T> = (initialValue: T) => Model<T>;

function createModel<T = Record<string, any>>({
  name,
  validators,
  computedProps
}: ModelOptions<T>): ModelFactory<T> {
  return (initialValue = {} as T) => {
    return {
      name,
      validate,
      validators,
      data: initialValue,
      computed: computedProps
    };
  };
}

export default createModel;
