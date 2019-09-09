import {
  ModelData,
  ModelComputedPropFn,
  ModelDataDefaultType
} from "../createModel";

export type Validator<T = ModelDataDefaultType> = (
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<any>>
) => true | string;
export type ModelValidationErrors = string[];

export type ValidateFn<T> = (
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<any>>,
  validators: Validator<T>[]
) => true | ModelValidationErrors;

function validate<T>(
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<T>>,
  validators: Validator<T>[]
): true | string[] {
  const validationResults = validators
    // Run through our validators
    .map(validate => validate(data, computedProps))
    // Filter out successful validations
    .filter(result => result !== true);

  // If there are non-true validation results, there were one or more
  // errors. Return them.
  if (validationResults.length) {
    return validationResults as string[];
  }
  return true;
}

export default validate;
