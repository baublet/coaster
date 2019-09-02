export default function propertyDoesNotExistOnSchema(property, table) {
  return `In our model correlating to table "${table}" was assigned a property named "${property}", which we do not define in the schema. Make sure you define this property in the schema!`;
}
