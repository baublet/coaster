import { Schema } from "..";

export type SchemaValidator = (schema: Schema) => true | string;

export default function validate(
  schema: Schema,
  validators: SchemaValidator[]
): true | string[] {
  const validity = validators
    .map(validate => validate(schema))
    .filter(result => result !== true);
  if (validity.length === 0) {
    return true;
  }
  return validity as string[];
}
