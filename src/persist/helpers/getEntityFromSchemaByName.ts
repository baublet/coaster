import { Schema } from "schema";
import { SchemaWithRelationshipsEntity } from "schema/relationship/schema";

export function getEntityFromSchemaByName(
  entityName: string,
  schema: Schema
): SchemaWithRelationshipsEntity {
  const entity = schema.entities.find(
    (node) => node.names.pascal === entityName
  );

  if (entity) {
    return entity;
  }

  throw new Error(
    `Unable to get a schema entity by its entity name! This should never happen, as we shouldn't be able to compile such a schema. Entity name: ${entityName}. Schema: ${JSON.stringify(
      schema
    )}`
  );
}
