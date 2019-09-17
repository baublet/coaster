import { SchemaColumnType } from ".";

interface SchemaBuilderOperation {
  type: string;
  database: string;
  table?: string;
  column?: string;
  payload?: any;
}

interface Column {
  autoIncrement: boolean;
  default: any;
  nullable: boolean;
  name: string;
  type: SchemaColumnType;
}

function column(operations: SchemaBuilderOperation[], name: string) {
  const options: Column = {
    name,
    autoIncrement: false,
    type: SchemaColumnType.TEXT,
    default: null,
    nullable: true
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

function table(operations: SchemaBuilderOperation[]) {
  const columns = {
    primaryKey: "id",
    id: column(operations, "id").type(SchemaColumnType.ID)
  };
  return {
    columns,
    createColumn: function(name: string) {
      if (columns[name]) return columns[name];
      columns[name] = column(operations, name);
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

function database(operations: SchemaBuilderOperation[]) {
  const tables = {};
  const indexes = {};
  return {
    indexes,
    tables,
    createTable: function(name: string) {
      if (tables[name]) return tables[name];
      tables[name] = table(operations);
      return tables[name];
    },
    renameTable: function(from: string, to: string) {
      if (tables[from]) throw `exists`;
      tables[from] = tables[to];
      delete tables[from];
      return this;
    },
    removeTable: function(name: string) {
      if (!tables[name]) throw `no table`;
      delete tables[name];
      return this;
    },
    createIndex: function(table: string, name: string, columns: string[]) {
      if (!tables[table]) throw `table doesn't exist`;
      if (indexes[name]) throw `index exists`;
      indexes[name] = {
        columns,
        table
      };
      return this;
    },
    removeIndex: function(table: string, name: string) {
      if (!tables[table]) throw `table doesn't exist`;
      if (!indexes[name]) throw `index doesn't exist`;
      delete indexes[name];
      return this;
    }
  };
}

export default function buildSchema() {
  const databases = {};
  const operations = [];
  return {
    operations,
    databases,
    database: function(name: string) {
      if (databases[name]) return databases[name];
      database[name] = database(operations);
      return database[name];
    }
  };
}
