export default function eagerLoadWithoutSchemaError() {
  return `You tried to eager load a query with a model that does not have a schema. We cannot eager load relationships across relationships we do not know about.`;
}
