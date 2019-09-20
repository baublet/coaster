import { SchemaColumnType } from ".";
import createDatabase from "./operations/database/create";
import removeDatabase from "./operations/database/remove";
import renameDatabase from "./operations/database/rename";
import databaseNotFound from "./errors/databaseNotFound";
import tableNotFound from "./errors/tableNotFound";

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

interface Column {
  autoIncrement: boolean;
  default: any;
  nullable: boolean;
  name: string;
  type: SchemaColumnType;
  tableName: string;
  databaseName: string;
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

function column(
  operations: SchemaBuilderOperation[],
  databaseName: string,
  tableName: string,
  name: string,
  columnOptions: SchemaCreateColumnOptions = {}
) {
  const options: Column = {
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
) {
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

function database(operations: SchemaBuilderOperation[], databaseName: string) {
  const tables = {};
  const indexes = {};
  return {
    indexes,
    tables,
    name: databaseName,
    createTable: function(name: string, options: SchemaCreateTableOptions) {
      tables[name] = table(operations, databaseName, name, options);
      return null;
    },
    renameTable: function(from: string, to: string) {
      if (tables[from]) throw `exists`;
      tables[from] = tables[to];
      delete tables[from];
      return null;
    },
    removeTable: function(name: string) {
      if (!tables[name]) throw `no table`;
      delete tables[name];
      return null;
    },
    createIndex: function(table: string, name: string, columns: string[]) {
      if (!tables[table]) throw `table doesn't exist`;
      if (indexes[name]) throw `index exists`;
      indexes[name] = {
        columns,
        table
      };
      return null;
    },
    removeIndex: function(table: string, name: string) {
      if (!tables[table]) throw tableNotFound(databaseName, name);
      if (!indexes[name]) throw `index doesn't exist`;
      delete indexes[name];
      return null;
    },
    table: function(name: string) {
      if (!tables[name]) throw tableNotFound(databaseName, name);
      return tables[name];
    }
  };
}

export default function buildSchema() {
  const databases = {};
  const operations = [];

  return {
    operations,
    databases,
    toJSON: () => "Placeholder",
    createDatabase: function(name: string) {
      operations.push(createDatabase(name));
      databases[name] = database(operations, name);
      return null;
    },
    database: function(name: string) {
      if (!databases[name]) {
        throw databaseNotFound(name);
      }
      return databases[name];
    },
    removeDatabase: function(name: string) {
      if (!databases[name]) {
        throw databaseNotFound(name);
      }
      operations.push(removeDatabase(name));
      delete databases[name];
      return null;
    },
    renameDatabase: function(from: string, to: string) {
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
