import { Schema } from "schema";
import { Connection, ConstrainerFunction } from "persist/connection";

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

export interface NormalizedModelFactory<
  M extends Model,
  NM extends NormalizedModel
> {
  (): (input: Partial<NM>) => NM;
  create(model: Partial<NM>): Promise<NM>;
  create(models: Partial<NM>[]): Promise<NM>;
  delete(id: string | number): Promise<number>;
  delete(ids: string[] | number[]): Promise<number>;
  deleteWhere(constrainer: ConstrainerFunction<NM>): Promise<number>;
  find(id: string | number): Promise<NM | undefined>;
  find(ids: string[] | number[]): Promise<NM[]>;
  findWhere(constrainer: ConstrainerFunction<NM>): Promise<NM[]>;
  update(model: Partial<NM>): Promise<NM>;
  update(id: string | number, data: Partial<NM>): Promise<NM>;
  updateWhere(
    data: Partial<NM>,
    constrainer: ConstrainerFunction<NM>
  ): Promise<number>;

  // Denormalized chain
  denormalized(): ModelFactory<M, NM>;
}

export interface ModelFactory<M extends Model, NM extends NormalizedModel> {
  (): (input: Partial<NM>) => M;
  create(model: Partial<NM>): Promise<M>;
  create(models: Partial<NM>[]): Promise<M>;
  delete(id: string | number): Promise<number>;
  delete(ids: string[] | number[]): Promise<number>;
  deleteWhere(constrainer: ConstrainerFunction<M>): Promise<number>;
  find(id: string | number): Promise<M | undefined>;
  find(ids: string[] | number[]): Promise<M[]>;
  findWhere(constrainer: ConstrainerFunction<M>): Promise<M[]>;
  update(model: Partial<M>): Promise<M>;
  update(id: string | number, data: Partial<NM>): Promise<M>;
  updateWhere(
    data: Partial<NM>,
    constrainer: ConstrainerFunction<NM>
  ): Promise<number>;

  // Normalized chain
  normalized(): NormalizedModelFactory<M, NM>;
}

export function createModel<M extends Model, NM extends NormalizedModel>() {
  // args: CreateModelFactoryArguments
}
