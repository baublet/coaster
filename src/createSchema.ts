import clone from "lodash.clonedeep";

import { Schema as BaseSchema } from "./primitive/schema";
import { generatePrimitiveTypes } from "./primitive/generatePrimitiveTypes";

import { SchemaWithRelationships } from "./relationship/schema";
import { generateRelationalTypes } from "./relationship/generateRelationalTypes";

import { GenerateRelationalTypesArguments } from "./relationship/generateRelationalTypes";

export type Schema = BaseSchema | SchemaWithRelationships;

export function createSchema(
  options: GenerateRelationalTypesArguments
): string {
  const layers = [generateRelationalTypes];
  const clonedOptions = clone(options);

  for (const layer of layers) {
    // Layers may modify the schema so that lower layers can operate on them
    const newSchema = layer(clonedOptions);
    clonedOptions.schema = newSchema;
  }

  return generatePrimitiveTypes(clonedOptions);
}
