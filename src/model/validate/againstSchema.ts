import { ModelData } from "model/createModel";
import {
  Schema,
  SchemaNode,
  SchemaNodeType,
  SchemaNodeTypeReadable
} from "model/schema";
import propertyDoesNotExistOnSchema from "model/error/propertyDoesNotExistOnSchema";
import propertyIsNotOfValidType from "model/error/propertyIsNotOfValidType";
import unknownSchemaNodeType from "model/error/unknownSchemaNodeType";

const numberTypes = [
  SchemaNodeType.BIG_INT,
  SchemaNodeType.DATE,
  SchemaNodeType.DECIMAL,
  SchemaNodeType.ID,
  SchemaNodeType.INT,
  SchemaNodeType.SMALL_INT
];

export default function validateAgainstSchema(
  data: ModelData,
  _: any,
  { $tableName, ...nodes }: Schema
): true | string[] {
  const errors = [];
  const typesMap = {};
  Object.values(nodes).forEach((node: SchemaNode) => {
    typesMap[node.names.canonical] = node.type;
  });
  Object.keys(data).forEach(key => {
    if (!typesMap[key]) {
      errors.push(propertyDoesNotExistOnSchema(key, $tableName));
    }
    const readableExpected = SchemaNodeTypeReadable[typesMap[key]];
    switch (typeof data[key]) {
      case "number":
        if (!numberTypes.includes(typesMap[key])) {
          errors.push(
            propertyIsNotOfValidType(
              key,
              $tableName,
              readableExpected,
              "number"
            )
          );
        }
        return;
      case "string":
        if (typesMap[key] !== SchemaNodeType.STRING) {
          errors.push(
            propertyIsNotOfValidType(
              key,
              $tableName,
              readableExpected,
              "string"
            )
          );
        }
        return;
      case "boolean":
        if (typesMap[key] !== SchemaNodeType.BOOLEAN) {
          errors.push(
            propertyIsNotOfValidType(
              key,
              $tableName,
              readableExpected,
              "boolean"
            )
          );
        }
        return;
      default:
        return unknownSchemaNodeType(readableExpected, $tableName);
    }
  });
  if (!errors.length) {
    return true;
  }
  return errors;
}
