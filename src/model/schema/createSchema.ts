import {
  Schema,
  schemaNodeDefaults,
  SchemaNodeType,
  SchemaNode
} from "./index";

const schemaNodeTypes = Object.values(SchemaNodeType);

export default function createSchema(schema: Schema): Schema {
  const compiledSchema = { ...schema };
  Object.keys(compiledSchema).forEach(key => {
    if (schemaNodeTypes.includes(compiledSchema[key])) {
      const type = compiledSchema[key];
      compiledSchema[key] = { type, ...schemaNodeDefaults } as SchemaNode;
    }
  });
  return compiledSchema;
}
