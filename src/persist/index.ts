import { Model, ModelFactory } from "../model/createModel";
import { Schema } from "./schema";

export enum PersistSortDirection {
  ASC,
  DESC
}

export interface PersistSortType {
  property: string;
  direction: PersistSortDirection;
}

export enum PersistMatcherType {
  EQUAL,
  NOT_EQUAL,
  GREATER_THAN,
  LESS_THAN,
  BETWEEN,
  NOT_BETWEEN,
  ONE_OF,
  NOT_ONE_OF
}

export interface PersistMatcher {
  property: string;
  type: PersistMatcherType;
  value: any;
}

export interface PersistQuery extends Record<string, any> {
  $and?: boolean;
  $limit?: number;
  $model: ModelFactory;
  $offset?: number;
  $or?: boolean;
  $sort?: PersistSortType[] | PersistSortType;
  $with?: PersistSelectWithQuery | PersistSelectWithQuery[];
  $without?: PersistSelectWithQuery | PersistSelectWithQuery[];
}

export interface PersistSelectWithQuery extends Record<string, any> {
  $and?: boolean;
  $or?: boolean;
}

export type PersistSelectQuery = PersistQuery;
export type PersistDeleteQuery = PersistQuery;

export interface PersistFindByProps {
  eager?: boolean;
  query: PersistSelectQuery;
  raw?: boolean;
}

export interface PersistAdapter {
  schema: Schema | null;
  defaultDatabase: string;
  deleteBy: (query: PersistDeleteQuery) => Promise<number>;
  findBy: (props: PersistFindByProps) => Promise<Model[]>;
  save: (
    target: Model | Model[]
  ) => Promise<boolean | string | boolean[] | string[]>;
}
