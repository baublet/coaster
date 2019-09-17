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

export interface SchemaDatabaseTableColumn {
  name: string;
  index: boolean;
  type: SchemaColumnType;
}

export interface SchemaDatabaseTable {
  name: string;
}

export interface SchemaDatabase {
  name: string;
  tables: SchemaDatabaseTable[];
}

export interface Schema {
  databases: SchemaDatabase[];
}
