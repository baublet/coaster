import { Model, ModelFactory } from "../model/createModel";

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
  BETWEEN_GREEDY,
  ONE_OF
}

export interface PersistMatcher {
  property: string;
  type: PersistMatcherType;
  value: any;
}

export interface PersistMergeConditionOptions {
  $hereProperty: string;
  $thereProperty: string;
}

export interface PersistMergeOptions {
  $model: ModelFactory;
  $hereProperty?: string;
  $thereProperty?: string;
}

export interface PersistQuery extends Record<string, any> {
  $and?: boolean;
  $limit?: number;
  $merge?: ModelFactory | PersistMergeOptions | PersistMergeOptions[];
  $offset?: number;
  $or?: boolean;
  $with?: PersistSelectWithQuery | PersistSelectWithQuery[];
  $without?: PersistSelectWithQuery | PersistSelectWithQuery[];
}

export interface PersistSelectWithQuery extends Record<string, any> {
  $and?: boolean;
  $or?: boolean;
}

export interface PersistSelectQuery extends PersistQuery {
  $model: ModelFactory;
}

export type PersistDeleteQuery = PersistSelectQuery;

export interface PersistFindByProps {
  eager?: boolean;
  limit?: number;
  offset?: number;
  query: PersistSelectQuery;
  raw?: boolean;
  sort?: PersistSortType[];
}

export interface PersistAdapter {
  deleteBy: (query: PersistDeleteQuery) => Promise<number>;
  findBy: (props: PersistFindByProps) => Promise<Model[]>;
  save: (target: Model | Model[]) => Promise<boolean | boolean[]>;
}
