import { ModelFactory } from "../createModel";

export enum SchemaNodeType {
  ARRAY,
  ARRAY_OF_IDS,
  DATE,
  FLOAT,
  ID,
  INT,
  MODEL,
  MODELS,
  // SLUG,
  STRING
}

export const schemaNodeTypes = Object.values(SchemaNodeType);

export function isSchemaNodeType(v: any): v is SchemaNodeType {
  if (typeof v !== "number") return false;
  if (schemaNodeTypes.includes(v)) return true;
  return false;
}

export function isSchemaNodeOptions(v: any): v is SchemaNodeOptions {
  if (typeof v !== "object") return false;
  if (!v.type) return false;
  return true;
}

export interface SchemaNodeOptions {
  type: SchemaNodeType | ModelFactory;
  uniqueName?: string;
  model?: ModelFactory;
  persistOptions?: {
    columnName?: string;
    nullable?: boolean;
    default?: any;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    unique?: boolean;
  };
}

export interface SchemaNode {
  type: SchemaNodeType;
  uniqueName: string;
  relation: boolean;
  model?: ModelFactory;
  names: {
    original: string;
    canonical: string;
    safe: string;
  };
  persistOptions: {
    autoIncrement: boolean;
    default?: any;
    foreignKey?: string;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
  };
}

export interface RequiredSchemaOptions {
  $tableName: string;
}

export type Schema = Record<string, SchemaNode | string> &
  RequiredSchemaOptions;
export type UncompiledSchema = Record<
  string,
  SchemaNodeOptions | SchemaNodeType | ModelFactory | string
> &
  RequiredSchemaOptions;
export type UncompiledSchemaWithOptionalTableName = Record<
  string,
  SchemaNodeOptions | SchemaNodeType | ModelFactory | string
>;

export const schemaNodeDbOptionsDefaults = (columnName: string) => ({
  autoIncrement: false,
  columnName,
  foreignKey: "id",
  nullable: true,
  primaryKey: false,
  unique: false
});
