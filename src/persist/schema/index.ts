export enum SchemaColumnType {
  ID = "BIGINT",
  BLOB = "BLOB",
  BOOLEAN = "BOOLEAN",
  DATE = "BIGINT",
  DECIMAL = "DECIMAL",
  ENUM = "ENUM",
  NUMBER = "BIGINT",
  TEXT = "TEXT"
}

export enum SchemaBuilderOperationType {
  DATABASE_CREATE,
  DATABASE_REMOVE,
  DATABASE_RENAME,

  CREATE_INDEX,
  REMOVE_INDEX,

  TABLE_CREATE,
  TABLE_REMOVE,
  TABLE_RENAME,
  TABLE_SET_PRIMARY_KEY,

  COLUMN_CREATE,
  COLUMN_REMOVE,
  COLUMN_RENAME,
  COLUMN_SET_DEFAULT,
  COLUMN_SET_AUTO_INCREMENT,
  COLUMN_SET_NULLABLE,
  COLUMN_SET_TYPE
}

export interface SchemaBuilderOperation {
  type: SchemaBuilderOperationType;
  database: string;
  table?: string;
  column?: string;
  payload?: Record<string, any>;
}

export interface SchemaColumnOptions {
  autoIncrement: boolean;
  default: any;
  nullable: boolean;
  name: string;
  type: SchemaColumnType;
}

export interface SchemaColumn {
  options: SchemaColumnOptions;
  autoIncrement: (autoIncrement: boolean) => null;
  type: (type: SchemaColumnType) => null;
  default: (value: any) => null;
  nullable: (nullable: boolean) => null;
}

export interface SchemaTableOptions {
  primaryKey?: string;
}

export interface SchemaTable {
  columns: Record<string, SchemaColumn>;
  databaseName: string;
  name: string;
  options: SchemaTableOptions;
  column: (name: string) => SchemaColumn;
  createColumn: (
    name: string,
    columnOptions?: SchemaCreateColumnOptions
  ) => null;
  renameColumn: (from: string, to: string) => null;
  removeColumn: (name: string) => null;
  setPrimaryKey: (column: string) => null;
}

export interface SchemaDatabase {
  indexes: any;
  tables: Record<string, SchemaTable>;
  name: string;
  createTable: (name: string, options?: SchemaCreateTableOptions) => null;
  renameTable: (from: string, to: string) => null;
  removeTable: (name: string) => null;
  createIndex: (table: string, name: string, columns: string[]) => null;
  removeIndex: (table: string, name: string) => null;
  table: (name: string) => SchemaTable;
}

export interface SchemaCreateTableOptions {
  withId?: boolean;
  withCreated?: boolean;
  withModified?: boolean;
}

export interface SchemaCreateColumnOptions {
  autoIncrement?: boolean;
  type?: SchemaColumnType;
  default?: any;
  nullable?: boolean;
}

export interface Schema {
  operations: SchemaBuilderOperation[];
  databases: Record<string, SchemaDatabase>;
  toJSON: () => string;
  createDatabase: (name: string) => null;
  database: (name: string) => SchemaDatabase;
  removeDatabase: (name: string) => null;
  renameDatabase: (from: string, to: string) => null;
}

export { default } from "persist/schema/shema";
