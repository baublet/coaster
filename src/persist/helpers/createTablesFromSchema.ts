import { v4 as uuid } from "uuid";

import { Schema } from "schema";
import { Connection, ColumnBuilder } from "persist/connection";
import { SchemaWithRelationshipEntityPropertyType } from "schema/relationship/schema";
import { SchemaNodeType } from "schema/primitive/schema";

type SchemaTableNames = [Record<string, string>, Schema];

function getTypeByNode(node: SchemaWithRelationshipEntityPropertyType) {
  if (typeof node === "string") return node;
  return node.type;
}

function nodeIsNullable(node: SchemaWithRelationshipEntityPropertyType) {
  if (typeof node === "string") return false;
  return true;
}

export async function createTablesFromSchema(
  connection: Connection,
  schema: Schema
): Promise<SchemaTableNames> {
  const entityTableMap: Record<string, string> = {};
  const seed = uuid();
  const tableCreationPromises = schema.entities.map((entity) => {
    const tableName = `${seed}-${entity.names.safe}`;
    entityTableMap[entity.names.pascal] = tableName;
    return connection.schema.createTable(tableName, function (table) {
      const columns = Object.keys(entity.nodes);
      for (const column of columns) {
        if (column === "id") {
          table.increments();
          continue;
        }
        const nodeType = getTypeByNode(entity.nodes[column]);
        let node: ColumnBuilder;
        switch (nodeType) {
          case SchemaNodeType.BOOLEAN:
            node = table.boolean(column);
            break;
          case SchemaNodeType.STRING:
            node = table.text(column);
            break;
          default:
            node = table.bigInteger(column);
            break;
        }
        if (nodeIsNullable(entity.nodes[column])) {
          node.nullable();
        } else {
          node.notNullable();
        }
      }
    });
  });
  await Promise.all(tableCreationPromises);
  return [entityTableMap, schema];
}
