import { GeneratedNames } from "helpers/generateNames";

export type Schema = {
  name?: string;
  description?: string;
  nodes: SchemaEntity[];
};

export enum SchemaNodeType {
  STRING,
  NUMBER,
  BOOLEAN
}

export interface SchemaEntity {
  names: GeneratedNames;
  description?: string;
  nodes: Record<string, SchemaEntityPropertyType>;
}

export type SchemaEntityPropertyType =
  | SchemaNodeType
  | SchemaEntityConfiguration;

export type SchemaEntityConfiguration =
  | SchemaNodeString
  | SchemaNodeNumber
  | SchemaNodeBoolean;

export function isSchemaEntityConfiguration(
  v: any
): v is SchemaEntityConfiguration {
  if (typeof v === "object") {
    if (typeof v.type === "number") {
      return true;
    }
  }
  return false;
}

export interface SchemaNodeBase {
  type: SchemaNodeType;
  nullable?: boolean;
}

export interface SchemaNodeString extends SchemaNodeBase {
  type: SchemaNodeType.STRING;
}

export interface SchemaNodeNumber extends SchemaNodeBase {
  type: SchemaNodeType.NUMBER;
}

export interface SchemaNodeBoolean extends SchemaNodeBase {
  type: SchemaNodeType.BOOLEAN;
}
