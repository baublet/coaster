import { Schema } from "schema";

import { Connection, ConstrainerFunction } from "../connection";
import {
  createCreateFunction,
  createDeleteFunction,
  createDeleteWhereFunction,
  createFindFunction,
  createFindWhereFunction,
  createUpdateFunction,
  createUpdateWhereFunction,
} from "./normalized";
import { getTableNameForEntityInSchema } from "persist/helpers/getTableNameForEntityInSchema";

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
export type Maybe<T> = void | T;

export type NormalizedModelFactory<NM extends NormalizedModel> = {
  (): (input: Partial<NM>) => NM;
  create(model: Partial<NM>): Promise<NM>;
  create(models: Partial<NM>[]): Promise<NM>;
  delete(id: string | number): Promise<number>;
  delete(ids: string[] | number[]): Promise<number>;
  deleteWhere(constrainer: ConstrainerFunction<NM>): Promise<number>;
  find(id: string | number): Promise<Maybe<NM>>;
  find(ids: string[] | number[]): Promise<NM[]>;
  findWhere(constrainer: ConstrainerFunction<NM>): Promise<NM[]>;
  update(model: Partial<NM>): Promise<NM>;
  update(id: string | number, data: Partial<NM>): Promise<NM>;
  updateWhere(
    data: Partial<NM>,
    constrainer: ConstrainerFunction<NM>
  ): Promise<number>;
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

  return partialNormalized as NormalizedModelFactory<NM>;
}
