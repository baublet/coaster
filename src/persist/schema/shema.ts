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

import columnExists from "./errors/columnExists";
import columnNotFound from "./errors/columnNotFound";
import createColumn from "./operations/column/create";
import createDatabase from "./operations/database/create";
import createIndex from "./operations/index/create";
import createTable from "./operations/table/create";
import databaseNotFound from "./errors/databaseNotFound";
import indexExists from "./errors/indexExists";
import indexNotFound from "./errors/indexNotFound";
import removeColumn from "./operations/column/remove";
import removeDatabase from "./operations/database/remove";
import removeIndex from "./operations/index/remove";
import removeTable from "./operations/table/remove";
import renameColumn from "./operations/column/rename";
import renameDatabase from "./operations/database/rename";
import renameTable from "./operations/table/rename";
import schemaToTree from "./toTree";
import setAttributeFactory, {
  SchemaColumnAttributes
} from "./operations/column/setAttribute";
import tableExists from "./errors/tableExists";
import tableNotFound from "./errors/tableNotFound";

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
    autoIncrement: setAttributeFactory<boolean>(
      options,
      operations,
      databaseName,
      tableName,
      name,
      SchemaColumnAttributes.TYPE
    ),
    type: setAttributeFactory<SchemaColumnType>(
      options,
      operations,
      databaseName,
      tableName,
      name,
      SchemaColumnAttributes.TYPE
    ),
    default: setAttributeFactory<any>(
      options,
      operations,
      databaseName,
      tableName,
      name,
      SchemaColumnAttributes.DEFAULT
    ),
    nullable: setAttributeFactory<boolean>(
      options,
      operations,
      databaseName,
      tableName,
      name,
      SchemaColumnAttributes.NULLABLE
    )
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
    columns.id = column(operations, databaseName, tableName, "id", {
      type: SchemaColumnType.ID
    });
    tableOptions.primaryKey = "id";
  }

  if (options.withCreated !== false) {
    columns.createdDate = column(
      operations,
      databaseName,
      tableName,
      "createdDate",
      {
        type: SchemaColumnType.DATE
      }
    );
  }

  if (options.withModified !== false) {
    columns.modifiedDate = column(
      operations,
      databaseName,
      tableName,
      "modifiedDate",
      {
        type: SchemaColumnType.DATE
      }
    );
  }

  return {
    columns,
    databaseName,
    name: tableName,
    options: tableOptions,
    column: function(name: string): SchemaColumn {
      if (!columns[name]) throw columnNotFound(databaseName, tableName, name);
      return columns[name];
    },
    createColumn: function(
      name: string,
      columnOptions: SchemaCreateColumnOptions = {}
    ): SchemaColumn {
      if (columns[name]) throw columnExists(databaseName, tableName, name);
      columns[name] = column(
        operations,
        databaseName,
        tableName,
        name,
        columnOptions
      );
      return columns[name];
    },
    renameColumn: function(from: string, to: string): SchemaColumn {
      if (!columns[from]) throw columnNotFound(databaseName, tableName, from);
      if (columns[to]) throw columnExists(databaseName, tableName, to);
      operations.push(renameColumn(databaseName, tableName, from, to));
      columns[to] = columns[from];
      delete columns[from];
      return columns[to];
    },
    removeColumn: function(name: string) {
      if (!columns[name]) throw columnNotFound(databaseName, tableName, name);
      operations.push(removeColumn(databaseName, tableName, name));
      delete columns[name];
      return null;
    },
    setPrimaryKey: function(column: string): SchemaColumn {
      if (!columns[column])
        throw columnNotFound(databaseName, tableName, column);
      tableOptions.primaryKey = column;
      return columns[column];
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
    ): SchemaTable {
      if (tables[name]) throw tableExists(databaseName, name);
      tables[name] = table(operations, databaseName, name, options);
      return tables[name];
    },
    renameTable: function(from: string, to: string): SchemaTable {
      if (tables[to]) throw tableExists(databaseName, to);
      operations.push(renameTable(databaseName, from, to));
      tables[to] = tables[from];
      delete tables[from];
      return tables[to];
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
    ): SchemaTable {
      if (!tables[table]) throw tableNotFound(databaseName, table);
      if (indexes[name]) throw indexExists(databaseName, name);
      indexes[name] = {
        columns,
        table
      };
      operations.push(createIndex(databaseName, table, name, columns));
      return tables[table];
    },
    removeIndex: function(table: string, name: string): null {
      if (!tables[table]) throw tableNotFound(databaseName, name);
      if (!indexes[name]) throw indexNotFound(databaseName, table, name);
      delete indexes[name];
      operations.push(removeIndex(databaseName, table, name));
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
    toTree: (): Record<string, any> => schemaToTree(databases),
    toJSON: (): string => JSON.stringify(schemaToTree(databases)),
    createDatabase: function(name: string): SchemaDatabase {
      operations.push(createDatabase(name));
      databases[name] = database(operations, name);
      return databases[name];
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
    renameDatabase: function(from: string, to: string): SchemaDatabase {
      if (!databases[from]) {
        throw databaseNotFound(from);
      }
      operations.push(renameDatabase(from, to));
      databases[to] = databases[from];
      delete databases[from];
      return databases[to];
    }
  };
}
