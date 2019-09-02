import { ModelFactory } from "../createModel";
import { GeneratedNames } from "helpers/generateNames";

export enum SchemaNodeType {
  ARRAY,
  ARRAY_OF_IDS,
  BIG_INT,
  BOOLEAN,
  DATE,
  DECIMAL,
  ID,
  INT,
  MODEL,
  MODELS,
  SLUG,
  SMALL_INT,
  STRING
}

export const SchemaNodeTypeReadable = {
  [SchemaNodeType.ARRAY]: "array",
  [SchemaNodeType.ARRAY_OF_IDS]: "array",
  [SchemaNodeType.BIG_INT]: "number",
  [SchemaNodeType.BOOLEAN]: "boolean",
  [SchemaNodeType.DATE]: "number",
  [SchemaNodeType.DECIMAL]: "number",
  [SchemaNodeType.ID]: "number",
  [SchemaNodeType.INT]: "number",
  [SchemaNodeType.MODEL]: "number",
  [SchemaNodeType.MODELS]: "array",
  [SchemaNodeType.SLUG]: "string",
  [SchemaNodeType.SMALL_INT]: "number",
  [SchemaNodeType.STRING]: "string"
};

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
    autoIncrement?: boolean;
    columnName?: string;
    default?: any;
    nullable?: boolean;
    precision?: number;
    primaryKey?: boolean;
    scale?: number;
    unique?: boolean;
  };
}

export interface SchemaNode {
  type: SchemaNodeType;
  uniqueName: string;
  relation: boolean;
  model?: ModelFactory;
  names: GeneratedNames;
  persistOptions: {
    index?: boolean;
    autoIncrement?: boolean;
    default?: any;
    foreignKey?: string;
    nullable?: boolean;
    precision?: number;
    primaryKey?: boolean;
    scale?: number;
    unique?: boolean;
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
  index: false,
  nullable: true,
  precision: 2,
  primaryKey: false,
  scale: 5,
  unique: false
});
