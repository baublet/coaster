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
  GREATER_THAN,
  LESS_THAN,
  BETWEEN,
  ONE_OF
}

interface PersistMatcher {
  property: string;
  type: PersistMatcherType;
  value: any;
}

interface PersistLogicalMatcher {
  $and?: PersistMatcher;
  $or?: PersistMatcher;
}

interface PersistFindByProps {
  matchers: PersistLogicalMatcher[];
  sortOrder: PersistSortType[];
  limit: number;
  offset: number;
}

interface PersistAdapter {
  delete: (target: string | Model | string[] | Model[]) => boolean | boolean[];
  find: (id: string | string[]) => Model | Model[];
  findBy: (props: PersistFindByProps) => Model[];
  save: (target: Model | Model[]) => boolean | boolean[];
}
