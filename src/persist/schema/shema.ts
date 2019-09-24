import {
  SchemaColumnType,
  SchemaBuilderOperation,
  SchemaCreateColumnOptions,
  SchemaColumn,
  SchemaCreateTableOptions,
  SchemaTable,
  SchemaDatabase,
  Schema,
  SchemaColumnOptions,
  SchemaTableOptions
} from ".";
import createDatabase from "./operations/database/create";
import removeDatabase from "./operations/database/remove";
import renameDatabase from "./operations/database/rename";
import databaseNotFound from "./errors/databaseNotFound";
import tableNotFound from "./errors/tableNotFound";
import schemaToJSON from "./toJSON";
import tableExists from "./errors/tableExists";
import createColumn from "./operations/column/create";
import removeTable from "./operations/table/remove";
import renameTable from "./operations/table/rename";
import createTable from "./operations/table/create";
import indexNameExists from "./errors/indexNameExists";
import columnExists from "./errors/columnExists";
import renameColumn from "./operations/column/rename";
import columnNotFound from "./errors/columnNotFound";
import removeColumn from "./operations/column/remove";

function column(
  operations: SchemaBuilderOperation[],
  databaseName: string,
  tableName: string,
  name: string,
  columnOptions: SchemaCreateColumnOptions = {}
): SchemaColumn {
  const options: SchemaColumnOptions = {
    name,
    autoIncrement: columnOptions.autoIncrement || false,
    type: columnOptions.type || SchemaColumnType.TEXT,
    default: columnOptions.default || null,
    nullable: columnOptions.nullable || false
  };
  operations.push(createColumn(databaseName, tableName, name, options));
  return {
    options,
    autoIncrement: function(autoIncrement: boolean = true) {
      options.autoIncrement = autoIncrement;
      return null;
    },
    type: function(type: SchemaColumnType) {
      options.type = type;
      return null;
    },
    default: function(value: any) {
      options.default = value;
      return null;
    },
    nullable: function(nullable: boolean) {
      options.nullable = nullable;
      return null;
    }
  };
}

function table(
  operations: SchemaBuilderOperation[],
  databaseName: string,
  tableName: string,
  options: SchemaCreateTableOptions = {}
): SchemaTable {
  const columns: any = {};
  const tableOptions: SchemaTableOptions = {};

  operations.push(createTable(databaseName, tableName));

  if (options.withId !== false) {
    columns.id = column(operations, databaseName, tableName, "id").type(
      SchemaColumnType.ID
    );
    tableOptions.primaryKey = "id";
  }

  if (options.withCreated !== false) {
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
    options: tableOptions,
    column: function(name: string): SchemaColumn {
      if (!columns[name]) throw `no col`;
      return columns[name];
    },
    createColumn: function(
      name: string,
      columnOptions: SchemaCreateColumnOptions = {}
    ) {
      if (columns[name]) throw columnExists(databaseName, tableName, name);
      columns[name] = column(
        operations,
        databaseName,
        tableName,
        name,
        columnOptions
      );
      return null;
    },
    renameColumn: function(from: string, to: string) {
      if (!columns[from]) throw `no column`;
      if (columns[to]) throw `seat's taken`;
      operations.push(renameColumn(databaseName, tableName, from, to));
      columns[to] = columns[from];
      delete columns[from];
      return null;
    },
    removeColumn: function(name: string) {
      if (!columns[name]) throw columnNotFound(databaseName, tableName, name);
      operations.push(removeColumn(databaseName, tableName, name));
      delete columns[name];
      return null;
    },
    setPrimaryKey: function(column: string) {
      if (!columns[column]) throw `no column`;
      tableOptions.primaryKey = column;
      return null;
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
      if (tables[name]) throw tableExists(databaseName, name);
      tables[name] = table(operations, databaseName, name, options);
      return null;
    },
    renameTable: function(from: string, to: string): null {
      if (tables[to]) throw tableExists(databaseName, to);
      operations.push(renameTable(databaseName, from, to));
      tables[to] = tables[from];
      delete tables[from];
      return null;
    },
    removeTable: function(name: string): null {
      if (!tables[name]) throw tableNotFound(databaseName, name);
      operations.push(removeTable(databaseName, name));
      delete tables[name];
      return null;
    },
    createIndex: function(
      table: string,
      name: string,
      columns: string[]
    ): null {
      if (!tables[table]) throw tableNotFound(databaseName, table);
      if (indexes[name]) throw indexNameExists(databaseName, name);
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
