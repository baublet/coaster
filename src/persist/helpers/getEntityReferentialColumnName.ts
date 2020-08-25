import { camelCase } from "change-case";

import { SchemaWithRelationshipsEntity } from "schema/relationship/schema";

export function getEntityReferentialColumnName(
  entity: SchemaWithRelationshipsEntity
): string {
  const idFieldName = entity.uniqueIdField ? entity.uniqueIdField : "id";
  return camelCase(`${entity.names.canonical} ${idFieldName}`);
}
