import { GeneratedNames } from "helpers/generateNames";
import {
  SchemaNodeType,
  SchemaEntityConfiguration,
  SchemaNodePrimitive,
} from "schema/primitive/schema";

export enum SchemaWithRelationshipNodeType {
  ONE_TO_ONE = "one_to_one",
  ONE_TO_MANY = "one_to_many",
  MANY_TO_ONE = "many_to_one",
  MANY_TO_MANY = "many_to_many",
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
  /**
   * The column name on this entity that references the ID of the foreign
   * entity. This might be something like "profileId" if this entity is a User.
   * If you don't set this, Coaster will try to infer this for you.
   */
  localColumn?: string;
  /**
   * If the foreign entity unique ID field is something other than "id", use this
   * field to tell Coaster what the column name is.
   */
  foreignColumn?: string;
}

export interface SchemaNodeWithOneToMany
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.ONE_TO_MANY;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
  /**
   * If the foreign column references this entity in some other way than
   * "entityId", use this field to tell Coaster how foreign columns denote their
   * attachment to this entity.
   * 
   * For example: User -> many Posts.
   * 
   * Posts has a "userId" field normally to denote their attachment to a User.
   * If your database model mandates that column be called "personId" instead,
   * you would enter "personId" as the value here.
   */
  foreignColumn?: string;
}

export interface SchemaNodeWithManyToOne
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.MANY_TO_ONE;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
  /**
   * If this entity references the foreign column by something other than
   * "entityId", denote that here.
   * 
   * For example: many Posts -> one User
   * 
   * A Post has a "userId" field on it that might reference which user it is
   * attached to. But if you need to call it something like "authorId" instead,
   * enter "authorId" as the value of this field.
   */
  localColumn?: string
  /**
   * If this entity references the foreign column by something other than its
   * unique ID field, denote that here.
   * 
   * For example: many Posts -> one User
   * 
   * A Post has a "username" field on it that references the "username" field on
   * the User object. For this scenario, `localColumn` would be "username", and
   * this field would also be called "username".
   */
  foreignColumn?: string
}

export interface SchemaNodeWithManyToMany
  extends SchemaNodeWithRelationshipBase {
  type: SchemaWithRelationshipNodeType.MANY_TO_MANY;
  /**
   * A string reference to the canonical (pascal-case) name of another entity
   */
  of: string;
  /**
   * Many-to-many relationships must be managed by an entirely separate database
   * table that manages these relationships. Enter the entity defined in your
   * schema that manages them.
   * 
   * For example: many Users <-> many Posts
   * 
   * Posts might be authored by multiple users. So we need at least an entity
   * referenced here called, for example, "UserPosts" with at least three
   * columns on it: "id", "postId", and "userId". If your data model is simple,
   * like the example here, this is all your need. The below options are for
   * complicated data models.
   */
  through: string;
  /**
   * If your through column references relationships via columns that Coaster
   * may not be able to infer, enter it here.
   * 
   * For example: many Users <-> many Posts
   * 
   * You might name your join table "PostAuthors", and reference the "User"
   * entities via a column called "authorId". If so, you would name this field
   * "authorId"
   */
  localThroughColumn?: string;
  /**
   * If your through column references relationships via columns that Coaster
   * may not be able to infer, enter it here.
   * 
   * For example: many Users <-> many Posts
   * 
   * You might name your join table "UserBlogs", and reference the "Post"
   * entities via a column called "blogId". You would thus name this field
   * "blogId".
   */
  foreignThroughColumn?: string;
  /**
   * If you reference your local column on your join table via any other field
   * but the ID, enter that here.
   * 
   * For example: many Users <-> many Posts
   * 
   * You might want to reference "PostUsers" by the user's username, rather than
   * their ID. If so, set this value to "username" and "localThroughColumn"
   * something like "username," as well.
   */
  localColumn?: string;
  /**
   * If you reference your foreign column on your join table via any other field
   * but the ID, enter that here.
   * 
   * For example: many Users <-> many Posts
   * 
   * You might want to reference "PostUsers" by the post's unique slug. If so, 
   * you would set this field to "slug". Similarly, you might set the value of
   * "foreignThroughColumn" to "slug", as well, so your data and application
   * models are consistent.
   */
  foreignColumn?: string;
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
