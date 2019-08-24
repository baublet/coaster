import {
  Schema,
  schemaNodeDefaults,
  SchemaNodeType,
  SchemaNode,
  UncompiledSchema
} from "./index";

import validate from "./validate";

const schemaNodeTypes = Object.values(SchemaNodeType);

export default function createSchema(schema: UncompiledSchema): Schema {
  const compiledSchema = { ...schema };
  Object.keys(compiledSchema).forEach(key => {
    if (schemaNodeTypes.includes(compiledSchema[key])) {
      const type = compiledSchema[key];
      compiledSchema[key] = {
        type,
        ...schemaNodeDefaults,
        uniqueName: key
      } as SchemaNode;
    }
  });
  const valid = validate(compiledSchema as Schema);
  if (valid) {
    return compiledSchema as Schema;
  }
  throw `Your schema is invalid

${valid}`;
}
