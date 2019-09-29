import {
  SchemaBuilderOperation,
  SchemaBuilderOperationType,
  SchemaColumnOptions
} from "persist/schema";

export enum SchemaColumnAttributes {
  AUTOINCREMENT = "autoincrement",
  DEFAULT = "default",
  LENGTH = "length",
  NULLABLE = "nullable",
  PRECISION = "precision",
  TYPE = "type",
  SCALE = "scale"
}

export function setAttribute(
  databaseName: string,
  tableName: string,
  name: string,
  attribute: SchemaColumnAttributes,
  value: any
): SchemaBuilderOperation {
  return {
    type: SchemaBuilderOperationType.COLUMN_CREATE,
    database: databaseName,
    table: tableName,
    column: name,
    payload: {
      attribute,
      value
    }
  };
}

export default function setAttributeFactory<T>(
  options: SchemaColumnOptions,
  operations: SchemaBuilderOperation[],
  database: string,
  table: string,
  column: string,
  attribute: SchemaColumnAttributes
) {
  return function(value: T) {
    options[attribute] = value;
    operations.push(setAttribute(database, table, column, attribute, value));
    return null;
  };
}
