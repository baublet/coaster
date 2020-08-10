import { Schema } from "schema";
import { entityNotFoundError } from "helpers/entityNotFoundError";

export function getUniqueIdFieldForEntityInSchema(
  schema: Schema,
  entityName: string
): string {
  const entities = schema.entities;

  for (const entity of entities) {
    if (entity.names.canonical === entityName) {
      return entity.uniqueIdField || "id";
    }
  }

  throw new Error(
    entityNotFoundError(
      entityName,
      entities,
      "We were unable to find the entity we want to create a model for."
    )
  );
}
