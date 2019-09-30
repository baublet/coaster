import {
  PersistSelectWithQuery,
  PersistSelectQuery,
  PersistMatcherType
} from "persist";

export default function findBy({
  $and = false,
  $limit = undefined,
  $model,
  $offset = 0,
  $or = false,
  $sort = [],
  $with = [],
  $without = [],
  ...query
}: PersistSelectQuery | PersistSelectWithQuery): string {
  const and = [];
  const or = [];

  const comparator = !$or ? and : or;

  Object.keys(query).forEach(key => {
    const logicalOperator = Array.isArray(query[key])
      ? PersistMatcherType.EQUAL
      : query[key][0];
    const value = Array.isArray(query[key]) ? query[key][1] : query[key];
    comparator.push([key, logicalOperator, value]);
  });

  $with.forEach(subQuery => {
    comparator.push(findBy(subQuery));
  });

  $without.forEach(subQuery => {
    // comparator.push()
  });

  return "";
}
