import { v4 as uuid } from "uuid";

import { Schema, SchemaNodeType } from "schema";
import {
  SchemaWithRelationshipEntityPropertyType,
  SchemaNodeWithOneToOne,
} from "schema/relationship/schema";

import { Connection, ColumnBuilder } from "../connection";
import { getForeignIdFieldForRelationship } from "./getForeignIdFieldForRelationship";
import { getEntityFromSchemaByName } from "./getEntityFromSchemaByName";

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
    const tableName = `${seed}-${entity.names.safePlural}`;
    entityTableMap[entity.names.pascal] = tableName;
    return connection.schema.createTable(tableName, function (table) {
      const columns = Object.keys(entity.nodes);
      for (const column of columns) {
        const entityNode = entity.nodes[column];
        if (column === "id") {
          table.increments();
          continue;
        }
        const nodeType = getTypeByNode(entityNode);
        let node: ColumnBuilder;
        switch (nodeType) {
          case SchemaNodeType.ONE_TO_ONE:
            node = table.bigInteger(
              getForeignIdFieldForRelationship(
                entityNode as SchemaNodeWithOneToOne,
                getEntityFromSchemaByName(
                  schema,
                  (entityNode as SchemaNodeWithOneToOne).of
                )
              )
            );
            break;
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
