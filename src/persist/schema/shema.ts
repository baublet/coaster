import { SchemaColumnType } from ".";
import createDatabase from "./operations/database/create";
import removeDatabase from "./operations/database/remove";
import renameDatabase from "./operations/database/rename";
import databaseNotFound from "./errors/databaseNotFound";
import tableNotFound from "./errors/tableNotFound";
import schemaToJSON from "./toJSON";

export enum SchemaBuilderOperationType {
  DATABASE_CREATE,
  DATABASE_REMOVE,
  DATABASE_RENAME,

  CREATE_INDEX,
  REMOVE_INDEX,

  TABLE_CREATE,
  TABLE_REMOVE,
  TABLE_RENAME,

  COLUMN_CREATE,
  COLUMN_REMOVE,
  COLUMN_RENAME,
  COLUMN_SET_DEFAULT,
  COLUMN_SET_AUTO_INCREMENT,
  COLUMN_SET_PRIMARY_KEY,
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

interface SchemaColumn {
  autoIncrement: boolean;
  default: any;
  nullable: boolean;
  name: string;
  type: SchemaColumnType;
  tableName: string;
  databaseName: string;
}

interface SchemaTable {
  columns: Record<string, SchemaColumn>;
  databaseName: string;
  name: string;
  column: (name: string) => SchemaColumn;
  createColumn: (name: string) => null;
  renameColumn: (from: string, to: string) => null;
  removeColumn: (name: string) => null;
  setPrimaryKey: (column: string) => null;
}

interface SchemaDatabase {
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

interface SchemaCreateTableOptions {
  withId?: boolean;
  withCreated?: boolean;
  withModified?: boolean;
}

interface SchemaCreateColumnOptions {
  autoIncrement?: boolean;
  type?: SchemaColumnType;
  default?: any;
  nullable?: boolean;
}

interface Schema {
  operations: SchemaBuilderOperation[];
  databases: Record<string, SchemaDatabase>;
  toJSON: () => string;
  createDatabase: (name: string) => null;
  database: (name: string) => SchemaDatabase;
  removeDatabase: (name: string) => null;
  renameDatabase: (from: string, to: string) => null;
}

function column(
  operations: SchemaBuilderOperation[],
  databaseName: string,
  tableName: string,
  name: string,
  columnOptions: SchemaCreateColumnOptions = {}
) {
  const options: SchemaColumn = {
    name,
    tableName,
    databaseName,
    autoIncrement: columnOptions.autoIncrement || false,
    type: columnOptions.type || SchemaColumnType.TEXT,
    default: columnOptions.default || null,
    nullable: columnOptions.nullable || false
  };
  return {
    options,
    autoIncrement: function(autoIncrement: boolean = true) {
      options.autoIncrement = autoIncrement;
    },
    type: function(type: SchemaColumnType) {
      options.type = type;
      return this;
    },
    default: function(value: any) {
      options.default = value;
      return this;
    },
    nullable: function(nullable: boolean) {
      options.nullable = nullable;
      return this;
    }
  };
}

function table(
  operations: SchemaBuilderOperation[],
  databaseName: string,
  tableName: string,
  options?: SchemaCreateTableOptions
): SchemaTable {
  const columns: any = {};

  if (options.withId !== false) {
    columns.id = column(operations, databaseName, tableName, "id").type(
      SchemaColumnType.ID
    );
    columns.primaryKey = "id";
  }

  if (options.withCreated) {
    columns.createdDate = column(
      operations,
      databaseName,
      tableName,
      "createdDate"
    ).type(SchemaColumnType.DATE);
  }

  if (options.withModified !== false) {
    columns.modifiedDate = column(
      operations,
      databaseName,
      tableName,
      "modifiedDate"
    ).type(SchemaColumnType.DATE);
  }

  return {
    columns,
    databaseName,
    name: tableName,
    column: function(name: string): SchemaColumn {
      if (!columns[name]) throw `no col`;
      return columns[name];
    },
    createColumn: function(name: string) {
      if (columns[name]) return columns[name];
      columns[name] = column(operations, databaseName, tableName, name);
      return this;
    },
    renameColumn: function(from: string, to: string) {
      if (!columns[from]) throw `no column`;
      if (columns[to]) throw `seat's taken`;
      columns[to] = columns[from];
      delete columns[from];
      return this;
    },
    removeColumn: function(name: string) {
      if (!columns[name]) throw `no column`;
      delete columns[name];
      return this;
    },
    setPrimaryKey: function(column: string) {
      if (!columns[column]) throw `no column`;
      columns.primaryKey = column;
      return this;
    }
  };
}

function database(
  operations: SchemaBuilderOperation[],
  databaseName: string
): SchemaDatabase {
  const tables = {};
  const indexes = {};
  return {
    indexes,
    tables,
    name: databaseName,
    createTable: function(
      name: string,
      options: SchemaCreateTableOptions
    ): null {
      tables[name] = table(operations, databaseName, name, options);
      return null;
    },
    renameTable: function(from: string, to: string): null {
      if (tables[from]) throw `exists`;
      tables[from] = tables[to];
      delete tables[from];
      return null;
    },
    removeTable: function(name: string): null {
      if (!tables[name]) throw `no table`;
      delete tables[name];
      return null;
    },
    createIndex: function(
      table: string,
      name: string,
      columns: string[]
    ): null {
      if (!tables[table]) throw `table doesn't exist`;
      if (indexes[name]) throw `index exists`;
      indexes[name] = {
        columns,
        table
      };
      return null;
    },
    removeIndex: function(table: string, name: string): null {
      if (!tables[table]) throw tableNotFound(databaseName, name);
      if (!indexes[name]) throw `index doesn't exist`;
      delete indexes[name];
      return null;
    },
    table: function(name: string): SchemaTable {
      if (!tables[name]) throw tableNotFound(databaseName, name);
      return tables[name];
    }
  };
}

export default function buildSchema(): Schema {
  const databases: Record<string, SchemaDatabase> = {};
  const operations: SchemaBuilderOperation[] = [];

  return {
    operations,
    databases,
    toJSON: (): string => schemaToJSON(databases),
    createDatabase: function(name: string): null {
      operations.push(createDatabase(name));
      databases[name] = database(operations, name);
      return null;
    },
    database: function(name: string): SchemaDatabase {
      if (!databases[name]) {
        throw databaseNotFound(name);
      }
      return databases[name];
    },
    removeDatabase: function(name: string): null {
      if (!databases[name]) {
        throw databaseNotFound(name);
      }
      operations.push(removeDatabase(name));
      delete databases[name];
      return null;
    },
    renameDatabase: function(from: string, to: string): null {
      if (!databases[from]) {
        throw databaseNotFound(from);
      }
      operations.push(renameDatabase(from, to));
      databases[to] = databases[from];
      delete databases[from];
      return null;
    }
  };
}
