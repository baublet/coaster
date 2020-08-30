import { Schema } from "schema";

import { getTableNameForEntityInSchema } from "../helpers/getTableNameForEntityInSchema";
import { Connection, RelationalDiscriminator } from "../connection";
import {
  createCreateFunction,
  createDeleteFunction,
  createDeleteWhereFunction,
  createFindFunction,
  createFindWhereFunction,
  createUpdateFunction,
  createUpdateWhereFunction,
} from "./normalized";
import { createDenormalizeModelsFunction } from "./relational";

export interface ModelFactoryOptions {
  connection?: Connection;
}

export interface CreateModelFactoryArguments {
  schema: Schema;
  entity: string;
  connection: Connection;
  tableName?: string;
}

export interface CreateModelFactoryFullArguments {
  schema: Schema;
  entity: string;
  connection: Connection;
  tableName: string;
}

export type Model = object;
export type NormalizedModel = object;
export type GeneratedModel = {
  normalizedModel: NormalizedModel;
  denormalizedModel: Model;
  methods?: Record<string, Record<string, Function>>;
};

export type Maybe<T> = void | T;

export type NormalizedModelFactory<
  M extends Model = any,
  NM extends NormalizedModel = any
> = {
  (): (input: Partial<NM>) => NM;
  create(model: Partial<NM>, options?: ModelFactoryOptions): Promise<NM>;
  create(models: Partial<NM>[], options?: ModelFactoryOptions): Promise<NM>;
  delete(id: string | number, options?: ModelFactoryOptions): Promise<number>;
  delete(
    ids: string[] | number[],
    options?: ModelFactoryOptions
  ): Promise<number>;
  deleteWhere(
    constrainer: RelationalDiscriminator<NM>,
    options?: ModelFactoryOptions
  ): Promise<number>;
  find(id: string | number, options?: ModelFactoryOptions): Promise<Maybe<NM>>;
  find(ids: string[] | number[], options?: ModelFactoryOptions): Promise<NM[]>;
  findWhere(
    constrainer: RelationalDiscriminator<NM>,
    options?: ModelFactoryOptions
  ): Promise<NM[]>;
  update(model: Partial<NM>, options?: ModelFactoryOptions): Promise<NM>;
  update(
    id: string | number,
    data: Partial<NM>,
    options?: ModelFactoryOptions
  ): Promise<NM>;
  updateWhere(
    data: Partial<NM>,
    constrainer: RelationalDiscriminator<NM>,
    options?: ModelFactoryOptions
  ): Promise<number>;
  denormalize(model: NM, options?: ModelFactoryOptions): M;
  denormalize(model: NM[], options?: ModelFactoryOptions): M[];
};

export function createModel<M extends Model, NM extends NormalizedModel = M>(
  args: CreateModelFactoryArguments
) {
  const table =
    args.tableName || getTableNameForEntityInSchema(args.schema, args.entity);

  const partialNormalized: any = (partial: Partial<NM>): NM => {
    return { ...partial } as NM;
  };

  partialNormalized.create = createCreateFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.delete = createDeleteFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.deleteWhere = createDeleteWhereFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.find = createFindFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.findWhere = createFindWhereFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.update = createUpdateFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.updateWhere = createUpdateWhereFunction<NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });

  // Denormalization overloads
  const denormalizeMany = createDenormalizeModelsFunction<M, NM>({
    schema: args.schema,
    entity: args.entity,
    connection: args.connection,
    tableName: table,
  });
  partialNormalized.denormalize = (nm: NM | NM[]): M | M[] => {
    if (Array.isArray(nm)) return denormalizeMany(nm);
    return denormalizeMany([nm])[0];
  };

  return partialNormalized as NormalizedModelFactory<M, NM>;
}
