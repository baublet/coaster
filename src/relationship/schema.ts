import { GeneratedNames } from "helpers/generateNames";
import {
  SchemaNodeType,
  SchemaEntityConfiguration,
  SchemaNodePrimitive
} from "primitive/schema";

export enum SchemaWithRelationshipNodeType {
  ONE_TO_ONE = "one_to_one",
  ONE_TO_MANY = "one_to_many",
  MANY_TO_ONE = "many_to_one",
  MANY_TO_MANY = "many_to_many"
}

export interface SchemaWithRelationships {
  name?: string;
  description?: string;
  entities: SchemaWithRelationshipsEntity[];
}

export interface SchemaWithRelationshipsEntity {
  names: GeneratedNames;
  description?: string;
  nodes: Record<string, SchemaWithRelationshipEntityPropertyType>;
  uniqueIdField?: string;
  uniqueIdType?: SchemaNodeType.NUMBER | SchemaNodeType.STRING;
}

export type SchemaWithRelationshipEntityPropertyType =
  | SchemaNodePrimitive
  | SchemaEntityConfiguration
  | SchemaNodeWithOneToOne
  | SchemaNodeWithOneToMany
  | SchemaNodeWithManyToOne
  | SchemaNodeWithManyToMany;

export interface SchemaNodeWithRelationshipBase {
  type: SchemaNodeType | SchemaWithRelationshipNodeType;
  nullable?: boolean;
}

export interface SchemaNodeWithOneToOne extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.ONE_TO_ONE;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
}

export interface SchemaNodeWithOneToMany
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.ONE_TO_MANY;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
}

export interface SchemaNodeWithManyToOne
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.MANY_TO_ONE;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
}

export interface SchemaNodeWithManyToMany
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.MANY_TO_MANY;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
}

export function isRelationalNode(
  node: SchemaWithRelationshipEntityPropertyType
): node is
  | SchemaNodeWithOneToOne
  | SchemaNodeWithOneToMany
  | SchemaNodeWithManyToMany
  | SchemaNodeWithManyToOne {
  if (typeof node === "string") return false;
  if (node.type === SchemaWithRelationshipNodeType.ONE_TO_ONE) return true;
  if (node.type === SchemaWithRelationshipNodeType.ONE_TO_MANY) return true;
  if (node.type === SchemaWithRelationshipNodeType.MANY_TO_MANY) return true;
  if (node.type === SchemaWithRelationshipNodeType.MANY_TO_ONE) return true;
  return false;
}
