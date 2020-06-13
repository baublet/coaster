export type Schema = BaseSchemaNode[];

export type BaseSchemaNode = RootObjectSchemaNode;

export type SchemaNode =
  | PrimitiveSchemaNode
  | ArraySchemaNode
  | ObjectPointerSchemaNode;

export type ObjectPropertySchemaNode =
  | PrimitiveSchemaNode
  | ObjectPropertyArraySchemaNode
  | ObjectPointerObjectPropertySchemaNode;

export enum SchemaNodeType {
  OBJECT = "object",
  ARRAY = "array",
  NUMBER = "number",
  STRING = "string",
  BOOLEAN = "boolean"
}

export interface PrimitiveSchemaNode {
  description?: string;
  type: SchemaNodeType.NUMBER | SchemaNodeType.STRING | SchemaNodeType.BOOLEAN;
}

export interface ObjectPointerObjectPropertySchemaNode {
  type: SchemaNodeType.OBJECT;
  name: string;
  description?: string;
}

export interface ObjectPointerSchemaNode {
  type: SchemaNodeType.OBJECT;
  name: string;
}

export type ArraySchemaOfNode =
  | SchemaNodeType.NUMBER
  | SchemaNodeType.STRING
  | SchemaNodeType.BOOLEAN
  | ObjectPointerSchemaNode
  | ArraySchemaNode;

export interface ObjectPropertyArraySchemaNode {
  type: SchemaNodeType.ARRAY;
  of: ArraySchemaOfNode | ArraySchemaOfNode[];
  description?: string;
}

export interface ArraySchemaNode {
  type: SchemaNodeType.ARRAY;
  of: ArraySchemaOfNode | ArraySchemaOfNode[];
}

export interface RootObjectSchemaNode {
  name: string;
  description?: string;
  type: SchemaNodeType.OBJECT;
  nodes: Record<string, ObjectPropertySchemaNode>;
}
