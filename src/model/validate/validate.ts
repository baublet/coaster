import { ModelData, ModelComputedPropFn } from "../createModel";
import { Schema } from "model/schema";

export type Validator<T> = (
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<any>>,
  schema: Schema
) => true | string;
export type ModelValidationErrors = string[];

export type ValidateFn<T> = (
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<any>>,
  schema: Schema,
  validators: Validator<T>[]
) => true | ModelValidationErrors;

function validate<T>(
  data: ModelData<T>,
  computedProps: Record<string, ModelComputedPropFn<T>>,
  schema: Schema,
  validators: Validator<T>[]
): true | string[] {
  const validationResults = validators
    // Run through our validators
    .map(validate => validate(data, computedProps, schema))
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
