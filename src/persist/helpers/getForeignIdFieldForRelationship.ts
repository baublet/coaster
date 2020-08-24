import {
  SchemaNodeWithOneToOne,
  SchemaNodeWithOneToMany,
  SchemaWithRelationshipsEntity,
} from "schema/relationship/schema";
import { getEntityReferentialColumnName } from "./getEntityReferentialColumnName";

export function getForeignIdFieldForRelationship(
  localNode: SchemaNodeWithOneToOne | SchemaNodeWithOneToMany,
  localEntity: SchemaWithRelationshipsEntity
): string {
  if (localNode.foreignColumn) return localNode.foreignColumn;
  return getEntityReferentialColumnName(localEntity);
}
