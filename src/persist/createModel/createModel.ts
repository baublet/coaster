import { Schema } from "schema";
import { QueryBuilder, Connection } from "persist/connection";

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

export type Model = Record<
  string,
  string | number | boolean | null | undefined | Model[]
>;
export type NormalizedModel = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ConstrainerFunction = (qb: QueryBuilder) => Promise<QueryBuilder>;

export interface NormalizedModelFactory<
  M extends Model,
  NM extends NormalizedModel
> {
  (): (input: Partial<M | NM>) => NM;
  create(model: Partial<M | NM>): Promise<NM>;
  create(models: Partial<M | NM>[]): Promise<NM>;
  delete(id: string | number): Promise<boolean>;
  delete(ids: string[] | number[]): Promise<boolean>;
  deleteWhere(constrainer: ConstrainerFunction): Promise<number>;
  find(id: string | number): Promise<NM | undefined>;
  find(ids: string[] | number[]): Promise<NM[]>;
  findWhere(constraints: Partial<NM | NM>): Promise<NM[]>;
  findWhere(constrainer: ConstrainerFunction): Promise<NM[]>;
  update(model: Partial<M | NM>): Promise<NM>;
  update(id: string | number, data: Partial<M | NM>): Promise<NM>;
  updateWhere(constrainer: ConstrainerFunction): Promise<NM[]>;

  // Denormalized chain
  denormalized(): ModelFactory<M, NM>;
}

export interface ModelFactory<M extends Model, NM extends NormalizedModel> {
  (): (input: Partial<M | NM>) => NM;
  create(model: Partial<M | NM>): Promise<M>;
  create(models: Partial<M | NM>[]): Promise<M>;
  delete(id: string | number): Promise<boolean>;
  delete(ids: string[] | number[]): Promise<boolean>;
  deleteWhere(constrainer: ConstrainerFunction): Promise<number>;
  find(id: string | number): Promise<M | undefined>;
  find(ids: string[] | number[]): Promise<M[]>;
  findWhere(constraints: Partial<M | NM>): Promise<M[]>;
  findWhere(constrainer: ConstrainerFunction): Promise<M[]>;
  update(model: Partial<M | NM>): Promise<M>;
  update(id: string | number, data: Partial<M | NM>): Promise<M>;
  updateWhere(constrainer: ConstrainerFunction): Promise<M[]>;

  // Normalized chain
  normalized(): NormalizedModelFactory<M, NM>;
}

export function createModel<M extends Model, NM extends NormalizedModel>(
  args: CreateModelFactoryArguments
) {}
