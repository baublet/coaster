import { Schema, SchemaNodeType, SchemaNode } from ".";

interface TableSchema {
  name: string;
  indexes: Record<string, IndexSchema>;
  columns: ColumnSchema[];
}

interface IndexSchema {
  column: string;
  name: string;
  unique: boolean;
}

interface ColumnSchema {
  name: string;
  type: SchemaNodeType;
  unique: boolean;
  uniqueName: string;
}

enum SqlColumnType {
  BOOLEAN = "BOOLEAN",
  TEXT = "TEXT",
  DECIMAL = "DECIMAL",
  INT = "INT",
  BIG_INT = "BIGINT",
  SMALL_INT = "SMALLINT",
  TINY_INT = "TINYINT"
}

function dbTypeFromSchemaNodeType(type: SchemaNodeType): SqlColumnType {
  switch (type) {
    case SchemaNodeType.BOOLEAN:
      return SqlColumnType.BOOLEAN;
    case SchemaNodeType.DECIMAL:
      return SqlColumnType.DECIMAL;
    case SchemaNodeType.INT:
      return SqlColumnType.INT;
    case SchemaNodeType.BIG_INT:
      return SqlColumnType.BIG_INT;
    case SchemaNodeType.ID:
      return SqlColumnType.BIG_INT;
    case SchemaNodeType.DATE:
      return SqlColumnType.INT;
  }

  return SqlColumnType.TEXT;
}

export default function tableSchemaFromCompiledSchema({
  $tableName,
  ...columns
}: Schema): TableSchema {
  const schema = {
    name: $tableName,
    indexes: {},
    columns: []
  };

  Object.values(columns).forEach((node: SchemaNode) => {
    const column = {
      autoIncrement: node.persistOptions.autoIncrement,
      default: node.persistOptions.default,
      name: node.names.safe,
      nullable: node.persistOptions.nullable,
      precision: node.persistOptions.precision,
      primaryKey: node.persistOptions.primaryKey,
      scale: node.persistOptions.scale,
      type: dbTypeFromSchemaNodeType(node.type),
      uniqueName: node.uniqueName
    };
    if (node.persistOptions.index) {
      schema.indexes[node.names.safe] = {
        name: `${$tableName}_${node.names.safe}_idx`
      };
    }
    schema.columns.push(column);
  });

  return schema;
}
