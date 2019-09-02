export default function propertyIsNotOfValidType(
  property: string,
  modelName: string,
  expectedType: string,
  receivedType: string
) {
  return `We set the property "${property}" on our model "${modelName}" to a ${receivedType}, but defined it in our schema as a "${expectedType}." This can cause unexpected data integrity issues. Make sure you coerce your types properly before saving them to your models.`;
}
