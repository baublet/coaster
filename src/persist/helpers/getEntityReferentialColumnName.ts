import { snakeCase } from "change-case";

import { SchemaWithRelationshipsEntity } from "schema/relationship/schema";

export function getEntityReferentialColumnName(
  entity: SchemaWithRelationshipsEntity
): string {
  const idFieldName = entity.uniqueIdField ? entity.uniqueIdField : "id";
  return snakeCase(`${entity.names.canonical} ${idFieldName}`);
}
