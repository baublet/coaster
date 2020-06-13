import { PersistModelRelationship } from "persist/types";

export function relationshipOptionsFor(
  relationships: PersistModelRelationship[],
  accessor: string
): PersistModelRelationship {
  for (let i = 0; i < relationships.length; i++) {
    if (relationships[i].accessor === accessor) {
      return relationships[i];
    }
  }
  throw new Error(
    `Unexpected error... we should never be trying to attach relationship helpers for relationships that don't exist. Accessor: ${accessor}. Relationships: ${JSON.stringify(
      relationships
    )}`
  );
}
