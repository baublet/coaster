import {
  ModelFactory,
  Model,
  ModelArgs,
  ModelArgsPropertyType,
  ModelArgsRegularPropertyArgs,
  ModelArgsRelationshipPropertyArgs
} from "../types";

type ValidationErrors<Args extends ModelArgs> = {
  readonly [K in keyof Args["properties"]]: false | string[];
};

export function validate<Args extends ModelArgs>(
  factory: ModelFactory<Args>,
  model: Model<Args>
): [boolean, ValidationErrors<Args>] {
  const errors = {};
  let hasError: boolean = false;

  // First up, accumulate all of the props
  for (const prop in factory.$options.properties) {
    errors[prop] = false;
  }

  // Validate required props
  for (const prop in factory.$options.properties) {
    const field = factory.$options.properties[prop];

    // Computed props can't be required
    if (field.type === ModelArgsPropertyType.COMPUTED) {
      continue;
    }

    if (
      (field as
        | ModelArgsRegularPropertyArgs
        | ModelArgsRelationshipPropertyArgs).required
    ) {
      if (!(prop in model)) {
        const error = `${prop} is required`;
        errors[prop] = errors[prop]
          ? errors[prop].push(error)
          : (errors[prop] = [error]);
        hasError = true;
      }
    }
  }

  // Validate fields with custom validators
  for (const prop in factory.$options.properties) {
    const field = factory.$options.properties[prop];
    const validators = field.validate;
    if (!validators) continue;

    for (const validator of validators) {
      const fieldErrors = validator(model[prop]);
      if (fieldErrors) {
        if (!errors[prop]) errors[prop] = [];
        errors[prop].push(...fieldErrors);
      }
    }
  }

  return [hasError, errors as ValidationErrors<Args>];
}
