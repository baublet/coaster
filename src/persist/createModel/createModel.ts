import { Schema } from "schema";
import { QueryBuilder } from "persist/connection";

export type Model = Record<
  string,
  string | number | boolean | null | undefined | Model[]
>;
export type NormalizedModel = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface CreateModelFactoryArguments {
  schema: Schema;
}

export type ConstrainerFunction = (qb: QueryBuilder) => Promise<QueryBuilder>;

export interface NormalizedModelFactory<
  M extends Model,
  NM extends NormalizedModel
> {
  (): (input: Partial<NM | M>) => NM;
  create(model: Partial<NM | M>): Promise<NM>;
  create(models: Partial<NM | M>[]): Promise<NM>;
  delete(id: string | number): Promise<boolean>;
  delete(ids: string[] | number[]): Promise<boolean>;
  deleteWhere(constrainer: ConstrainerFunction): Promise<number>;
  find(id: string | number): Promise<NM | undefined>;
  find(ids: string[] | number[]): Promise<NM[]>;
  findWhere(constraints: Partial<NM | NM>): Promise<NM[]>;
  findWhere(constrainer: ConstrainerFunction): Promise<NM[]>;
  update(model: Partial<NM | M>): Promise<NM>;
  update(id: string | number, data: Partial<NM | M>): Promise<NM>;
  updateWhere(constrainer: ConstrainerFunction): Promise<NM[]>;

  // Denormalized chain
  denormalized(): ModelFactory<M, NM>;
}

export interface ModelFactory<M extends Model, NM extends NormalizedModel> {
  (): (input: Partial<NM | M>) => NM;
  create(model: Partial<NM | M>): Promise<M>;
  create(models: Partial<NM | M>[]): Promise<M>;
  delete(id: string | number): Promise<boolean>;
  delete(ids: string[] | number[]): Promise<boolean>;
  deleteWhere(constrainer: ConstrainerFunction): Promise<number>;
  find(id: string | number): Promise<M | undefined>;
  find(ids: string[] | number[]): Promise<M[]>;
  findWhere(constraints: Partial<NM | M>): Promise<M[]>;
  findWhere(constrainer: ConstrainerFunction): Promise<M[]>;
  update(model: Partial<NM | M>): Promise<M>;
  update(id: string | number, data: Partial<NM | M>): Promise<M>;
  updateWhere(constrainer: ConstrainerFunction): Promise<M[]>;

  // Normalized chain
  normalized(): NormalizedModelFactory<M, NM>;
}

export function createModel<M extends Model, NM extends NormalizedModel>(
  schema: Schema
) {}
