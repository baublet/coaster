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

export interface PersistSelectQuery extends Record<string, any> {
  $model: ModelFactory;
  $and?: boolean;
  $or?: boolean;
  $with?: PersistSelectWithQuery | PersistSelectWithQuery[];
  $without?: PersistSelectWithQuery | PersistSelectWithQuery[];
}

export interface PersistSelectWithQuery extends Record<string, any> {
  $and?: boolean;
  $or?: boolean;
}

export interface PersistFindByProps {
  query: PersistSelectQuery;
  sort?: PersistSortType[];
  limit?: number;
  offset?: number;
  raw?: boolean;
}

export interface PersistAdapter {
  delete: (target: string | Model | string[] | Model[]) => boolean | boolean[];
  find: (id: string | string[]) => Model | Model[];
  findBy: (props: PersistFindByProps) => Model[];
  save: (target: Model | Model[]) => boolean | boolean[];
}
