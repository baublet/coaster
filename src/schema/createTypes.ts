import clone from "lodash.clonedeep";

import { generatePrimitiveTypes } from "./primitive/generatePrimitiveTypes";
import { generateRelationalTypes } from "./relationship/generateRelationalTypes";

import { GenerateRelationalTypesArguments } from "./relationship/generateRelationalTypes";
import { CustomTypes } from "./createSchema";

export function createTypes(options: GenerateRelationalTypesArguments): string {
  const layers = [generateRelationalTypes];
  const clonedOptions = clone(options);
  const customTypes: CustomTypes = [];

  for (const layer of layers) {
    // Layers may modify the schema so that lower layers can operate on them
    const [newSchema, layerCustomTypes] = layer(clonedOptions);
    clonedOptions.schema = newSchema;
    customTypes.push(...layerCustomTypes);
  }

  const entities = generatePrimitiveTypes(clonedOptions);

  return customTypes.join("\n") + "\n\n" + entities;
}
