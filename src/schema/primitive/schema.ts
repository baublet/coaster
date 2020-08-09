import { GeneratedNames } from "helpers/generateNames";

export type Schema = {
  name?: string;
  description?: string;
  entities: SchemaEntity[];
};

export enum SchemaNodeType {
  ARRAY = "array",
  BOOLEAN = "boolean",
  NUMBER = "number",
  RAW = "raw",
  STRING = "string"
}

export type SchemaNodePrimitive =
  | SchemaNodeType.BOOLEAN
  | SchemaNodeType.NUMBER
  | SchemaNodeType.STRING;

export interface SchemaEntity {
  names: GeneratedNames;
  nodes: Record<string, SchemaEntityPropertyType>;
  description?: string;
}

export type SchemaEntityPropertyType =
  | SchemaNodePrimitive
  | SchemaEntityConfiguration;

// Entity types that require configuration
export type SchemaEntityConfiguration =
  | SchemaNodeString
  | SchemaNodeNumber
  | SchemaNodeBoolean
  | SchemaNodeArray
  | SchemaNodeRaw;

export function isSchemaEntityConfiguration(
  v: any
): v is SchemaEntityConfiguration {
  if (typeof v === "object") {
    if (typeof v.type === "string") {
      return true;
    }
  }
  return false;
}

export interface SchemaNodeBase {
  type: SchemaNodeType;
  nullable?: boolean;
}

export interface SchemaNodeBaseWithInternalTypes {
  type: SchemaNodeType;
  nullable?: boolean;
}

export interface SchemaNodeRaw extends SchemaNodeBaseWithInternalTypes {
  type: SchemaNodeType.RAW;
  definition: string;
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

export interface SchemaNodeArray extends SchemaNodeBase {
  type: SchemaNodeType.ARRAY;
  of: SchemaNodeType.STRING | SchemaNodeType.NUMBER | SchemaNodeType.BOOLEAN;
}
