export enum SchemaNodeType {
  ID,
  STRING,
  INT,
  FLOAT,
  MODEL,
  MODELS
}

export interface SchemaNodeOptions {
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
  uniqueName?: null;
}

export interface SchemaNode {
  type: SchemaNodeType;
  names: {
    canonical: string,
    safe: string
  },
  nullable: boolean;
  default?: any;
  primaryKey: boolean;
  autoIncrement: boolean;
  unique: boolean;
  uniqueName: null;
}

export type Schema = Record<string, SchemaNode>;
export type UncompiledSchema = Record<string, SchemaNodeOptions | SchemaNodeType>

export const schemaNodeDefaults = {
  nullable: true,
  default: null,
  primaryKey: false,
  autoIncrement: false,
  unique: false
};
