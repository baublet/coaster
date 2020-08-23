import clone from "lodash.clonedeep";

import { GeneratedNames, generateNames } from "helpers/generateNames";

import { GenerateTypesBaseArguments } from "schema/primitive/generatePrimitiveTypes";
import { Schema, SchemaEntity, SchemaNodeType } from "schema/primitive/schema";

import {
  SchemaWithRelationships,
  isRelationalNode,
  SchemaWithRelationshipNodeType,
  SchemaWithRelationshipsEntity,
} from "./schema";
import { entityNotFoundError } from "helpers/entityNotFoundError";
import { CustomTypes } from "../createSchema";

export type GenerateRelationalTypesArguments = GenerateTypesBaseArguments & {
  schema: SchemaWithRelationships;
};

function getEntityIdFieldAndType(
  entity: SchemaWithRelationshipsEntity
): {
  uniqueIdField: string;
  uniqueIdType: SchemaNodeType.STRING | SchemaNodeType.NUMBER;
} {
  let uniqueIdField = "id";
  if (entity.uniqueIdField) uniqueIdField = entity.uniqueIdField;

  let uniqueIdType = SchemaNodeType.NUMBER;
  if (entity.uniqueIdType) uniqueIdType = entity.uniqueIdType;

  return {
    uniqueIdField,
    uniqueIdType: uniqueIdType as SchemaNodeType.STRING | SchemaNodeType.NUMBER,
  };
}

export function generateRelationalTypes({
  schema,
}: GenerateRelationalTypesArguments): [Schema, CustomTypes] {
  const customTypes: CustomTypes = [];
  const newSchema: Schema = {
    name: schema.name,
    description: schema.description,
    entities: [],
  };

  const allTransformedEntities: SchemaWithRelationshipsEntity[] =
    newSchema.entities;
  const secondPassEntities: SchemaWithRelationshipsEntity[] = [];
  const entityReferences: Record<
    string,
    {
      names: GeneratedNames;
      uniqueIdField: string;
      uniqueIdType: SchemaNodeType.NUMBER | SchemaNodeType.STRING;
    }
  > = {};

  // First pass: sort our simple and relational entities so we get the simple
  // entities out of the way, first. During this pass, we also build a map of
  // entity names and ids for the second pass
  for (const entity of schema.entities) {
    // Build the map
    const { uniqueIdField, uniqueIdType } = getEntityIdFieldAndType(entity);
    entityReferences[entity.names.pascal] = {
      names: entity.names,
      uniqueIdField,
      uniqueIdType,
    };

    // Separate our primitive entities from our relational entities
    let entitySorted = false;
    const nodes = Object.values(entity.nodes);
    for (const node of nodes) {
      if (isRelationalNode(node)) {
        secondPassEntities.push(entity);
        entitySorted = true;
        break;
      }
    }
    if (!entitySorted) {
      // If we get here, we know the entity doesn't have a relationship, so we
      // can stick it onto the pile of work we don't have to do/already did.
      allTransformedEntities.push(entity as SchemaEntity);
    }
  }

  // If there are second-pass entities, we need to add some custom types to the
  // emitted type definitions.
  if (secondPassEntities.length > 0) {
    customTypes.push('import { RelationalDiscriminator } from "coaster";');
  }

  // Second pass: normalize the original entities
  for (const entity of secondPassEntities) {
    const nodes = Object.entries(entity.nodes);
    const normalizedEntity: SchemaEntity = {
      names: generateNames(`normalized${entity.names.pascal}`),
      description: entity.description,
      nodes: {},
    };
    const denormalizedEntity: SchemaEntity = clone(normalizedEntity);
    denormalizedEntity.names = entity.names;

    for (const [property, node] of nodes) {
      if (!isRelationalNode(node)) {
        normalizedEntity.nodes[property] = node;
        denormalizedEntity.nodes[property] = node;
        continue;
      }

      const referencedNode = entityReferences[node.of];
      if (!referencedNode) {
        throw new Error(
          entityNotFoundError(
            node.of,
            schema.entities,
            `Entity ${entity.names.pascal} references an unknown entity.`
          )
        );
      }

      const newKey = `${referencedNode.names.camel}Id`;

      if (
        node.type === SchemaWithRelationshipNodeType.ONE_TO_ONE ||
        node.type === SchemaWithRelationshipNodeType.MANY_TO_ONE
      ) {
        const nullable = Boolean(node.nullable);
        normalizedEntity.nodes[newKey] = {
          type: referencedNode.uniqueIdType,
          nullable,
        };
        denormalizedEntity.nodes[property] = {
          type: SchemaNodeType.RAW,
          nullable,
          definition: `() => Promise<Normalized${referencedNode.names.pascal}${
            nullable ? " | null" : ""
          }>`,
        };
        continue;
      }

      if (
        node.type === SchemaWithRelationshipNodeType.ONE_TO_MANY ||
        node.type === SchemaWithRelationshipNodeType.MANY_TO_MANY
      ) {
        const nullable = Boolean(node.nullable);
        normalizedEntity.nodes[newKey] = {
          type: referencedNode.uniqueIdType,
          nullable,
        };
        denormalizedEntity.nodes[property] = {
          type: SchemaNodeType.RAW,
          nullable,
          definition: `(discriminator?: RelationalDiscriminator) => Promise<Normalized${referencedNode.names.pascal}[]>`,
        };
        continue;
      }
    }

    newSchema.entities.push(normalizedEntity);
    newSchema.entities.push(denormalizedEntity);
  }

  return [newSchema, customTypes];
}
