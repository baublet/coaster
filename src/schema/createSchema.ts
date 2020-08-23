import cloneDeep from "lodash.clonedeep";

import { GeneratedNames, generateNames } from "helpers/generateNames";

import {
  SchemaWithRelationships,
  SchemaWithRelationshipNodeType,
  SchemaWithRelationshipEntityPropertyType,
} from "./relationship/schema";
import { SchemaNodeType as PrimitiveSchemaNodeType } from "./primitive/schema";

export type CustomTypes = string[];

export const SchemaNodeType = {
  ...PrimitiveSchemaNodeType,
  ...SchemaWithRelationshipNodeType,
};

export type Schema = SchemaWithRelationships;

export interface SchemaNodeEntityWithNames {
  names: GeneratedNames;
  description?: string;
  nodes: Record<string, SchemaWithRelationshipEntityPropertyType>;
  uniqueIdField?: string;
  uniqueIdType?: typeof SchemaNodeType.NUMBER | typeof SchemaNodeType.STRING;
}

export interface SchemaNodeBaseEntityType {
  name: string;
  description?: string;
  nodes: Record<string, SchemaWithRelationshipEntityPropertyType>;
  uniqueIdField?: string;
  uniqueIdType?: typeof SchemaNodeType.NUMBER | typeof SchemaNodeType.STRING;
}

export type SchemaNode = SchemaNodeEntityWithNames | SchemaNodeBaseEntityType;

export interface SchemaOptions {
  name?: string;
  description?: string;
  entities: SchemaNode[];
  /**
   * When generating types, we may need to throw custom things into the file,
   * like imports, custom interfaces that aren't entities, and the like. Add
   * them to this array, and these will be added to the top of the file.
   */
  customTypes?: CustomTypes;
}

function hasNames(obj: SchemaNode): obj is SchemaNodeEntityWithNames {
  const keys = Object.keys(obj);
  if (keys.includes("names")) return true;
  return false;
}

export function createSchema(schema: SchemaOptions): Schema {
  const clonedSchema: SchemaOptions = cloneDeep(schema);
  const transformedEntities: SchemaNode[] = clonedSchema.entities.map(
    (node) => ({
      ...node,
      names: hasNames(node) ? node.names : generateNames(node.name),
    })
  );
  clonedSchema.entities = transformedEntities;
  if (!clonedSchema.customTypes) {
    clonedSchema.customTypes = [];
  }
  return clonedSchema as Schema;
}
