import knex from "knex";
import { GeneratedNames } from "../helpers";

export type Connection = knex<any, unknown[]>;
export type QueryBuilder<T = any> = knex.QueryBuilder<T, unknown[]>;
export type Transaction<T = any> = knex.Transaction<T, any>;
export type ColumnBuilder = knex.ColumnBuilder;
export type RelationalDiscriminator<T = any> = (
  qb: QueryBuilder<T>
) => QueryBuilder<T>;

export type Model<T extends ModelDetails<any>> = T["$modelPrimitiveTypes"];

export function isConnection(value: any): value is Connection {
  if (typeof value !== "object") {
    return false;
  }
  if ("__knex__" in value) {
    return true;
  }
  return false;
}

export type ModelPropertyType = "string" | "number" | "boolean";

type ModelPrimitiveType = "string" | "number" | "boolean";

export type ModelPrimitivePropertyTypeFromDefinition<
  T extends ModelPrimitiveType
> = T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : never;

export type RecordFromTypeWithOptionals<
  T extends object,
  OptionalKeys extends keyof T
> = Required<Omit<T, OptionalKeys>> & Partial<Pick<T, OptionalKeys>>;

export type ModelPropertyDefinitionPrimitive<
  T extends ModelPropertyType,
  Nullable extends boolean = false
> = {
  default?: ModelPrimitivePropertyTypeFromDefinition<T>;
  nullable: Nullable;
  type: T;
};

type ModelPropertyPrimitiveDefinition =
  | ModelPropertyDefinitionPrimitive<"string">
  | ModelPropertyDefinitionPrimitive<"string", true>
  | ModelPropertyDefinitionPrimitive<"number">
  | ModelPropertyDefinitionPrimitive<"number", true>
  | ModelPropertyDefinitionPrimitive<"boolean">
  | ModelPropertyDefinitionPrimitive<"boolean", true>;

export type ModelPropertyDefinition = ModelPropertyPrimitiveDefinition;

export type ModelPropertyDefinitions = { [k: string]: ModelPropertyDefinition };

export type CreateModelArguments = {
  name: GeneratedNames;
  properties: ModelPropertyDefinitions;
  methods?: {
    [key: string]: Function;
    create?: Function;
    delete?: Function;
    find?: Function;
    save?: Function;
  };
};

export type NullableKeys<T extends ModelPropertyDefinitions> = {
  [K in keyof T]: T[K]["nullable"] extends false ? never : K;
}[keyof T];

export type ModelPrimitiveTypes<
  A extends CreateModelArguments
> = RecordFromTypeWithOptionals<
  {
    [K in keyof A["properties"]]: A["properties"][K] extends ModelPropertyPrimitiveDefinition
      ? ModelPrimitivePropertyTypeFromDefinition<A["properties"][K]["type"]>
      : never;
  },
  NullableKeys<A["properties"]>
>;

type IdType = string | number;
export type Validator<P extends object> = (
  args: P
) => true | string | Promise<true | string>;

export type CustomMethodOr<
  T extends CreateModelArguments,
  K extends "create" | "delete" | "find" | "save",
  D
> = T["methods"][K] extends Function ? T["methods"][K] : D;

export type CreateMethod<T extends CreateModelArguments> = (
  args: Partial<ModelPrimitiveTypes<T>>
) => Promise<ModelPrimitiveTypes<T>>;

export type DeleteMethod<T extends CreateModelArguments> = ((
  id: IdType
) => Promise<number>) &
  ((ids: IdType[]) => Promise<number>) &
  ((where: RelationalDiscriminator<ModelPrimitiveTypes<T>>) => Promise<number>);

export type FindMethod<T extends CreateModelArguments> = ((
  id: IdType
) => Promise<ModelPrimitiveTypes<T>>) &
  ((ids: IdType[]) => Promise<ModelPrimitiveTypes<T>[]>) &
  ((
    where: RelationalDiscriminator<ModelPrimitiveTypes<T>>
  ) => Promise<ModelPrimitiveTypes<T>[]>);

export type SaveMethod<T extends CreateModelArguments> = (
  args: Partial<ModelPrimitiveTypes<T>>
) => Promise<ModelPrimitiveTypes<T>>;

export interface ModelDetails<T extends CreateModelArguments> {
  $originalArguments: T;
  $modelPrimitiveTypes: ModelPrimitiveTypes<T>;
  $nullableKeys: NullableKeys<T["properties"]>[];
  $nullableKeyType: NullableKeys<T["properties"]>;
  $validators: Validator<Partial<ModelPrimitiveTypes<T>>>[];
  create: CustomMethodOr<T, "create", CreateMethod<T>>;
  delete: CustomMethodOr<T, "delete", DeleteMethod<T>>;
  find: CustomMethodOr<T, "find", FindMethod<T>>;
  save: CustomMethodOr<T, "save", SaveMethod<T>>;
  validate(m: ModelPrimitiveTypes<T>): Promise<[boolean, string[]]>;
  withValidator(
    validator: Validator<Partial<ModelPrimitiveTypes<T>>>
  ): ModelDetails<T>;
  withValidators(
    v: Validator<Partial<ModelPrimitiveTypes<T>>>[]
  ): ModelDetails<T>;
}
