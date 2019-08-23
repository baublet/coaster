export enum SchemaNodeType {
  ID,
  STRING,
  INT,
  FLOAT,
  MODEL,
  MODELS
}

export interface SchemaNode {
  type: SchemaNodeType;
  names: {
    canonical: string,
    safe: string
  },
  nullable?: boolean;
  default?: any;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  unique?: boolean;
}

export type Schema = Record<string, SchemaNode | SchemaNodeType>;

export const schemaNodeDefaults = {
  nullable: true,
  default: null,
  primaryKey: false,
  autoIncrement: false,
  unique: false
};
