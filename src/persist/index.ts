import { Model } from "../model/createModel";

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

export interface PersistQuery extends Record<string, any> {
  $and?: boolean;
  $or?: boolean;
  $with?: PersistQuery | PersistQuery[];
  without?: PersistQuery | PersistQuery[];
}

export interface PersistFindByProps {
  query: PersistQuery;
  sort?: PersistSortType[];
  limit?: number;
  offset?: number;
}

export interface PersistAdapter {
  delete: (target: string | Model | string[] | Model[]) => boolean | boolean[];
  find: (id: string | string[]) => Model | Model[];
  findBy: (props: PersistFindByProps) => Model[];
  save: (target: Model | Model[]) => boolean | boolean[];
}
