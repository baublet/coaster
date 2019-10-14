import {
  PersistSelectWithQuery,
  PersistSelectQuery,
  PersistMatcherType
} from "persist";
import { SqlStatement } from "../sqlite";
import andAndOrCannotCoexist from "persist/error/andAndOrCannotCoexist";

type PersistMatcherTransitionalType = [string, PersistMatcherType, any];

function comparatorToString([
  prop,
  comparator
]: PersistMatcherTransitionalType): string {
  switch (comparator) {
    case PersistMatcherType.BETWEEN:
      return `${prop} BETWEEN ?`;
    case PersistMatcherType.GREATER_THAN:
      return `${prop} > ?`;
    case PersistMatcherType.LESS_THAN:
      return `${prop} < ?`;
    case PersistMatcherType.NOT_BETWEEN:
      return `${prop} NOT BETWEEN ?`;
    case PersistMatcherType.NOT_EQUAL:
      return `${prop} <> ?`;
    case PersistMatcherType.ONE_OF:
      return `${prop} IN ?`;
    case PersistMatcherType.NOT_ONE_OF:
      return `${prop} NOT IN ?`;
    default:
      return `${prop} = ?`;
  }
}

export default function whereFragment(
  query: PersistSelectQuery | PersistSelectWithQuery
): SqlStatement {
  const { $and = false, $or = false, $with = [], $without = [] } = query;

  if ($and && $or) {
    throw andAndOrCannotCoexist(query);
  }

  const comparator = !$or ? "AND" : "OR";

  const comparators = [];
  const notComparators = [];

  Object.keys(query).forEach(key => {
    if (key[0] === "$") return;
    const logicalOperator = Array.isArray(query[key])
      ? PersistMatcherType.EQUAL
      : query[key][0];
    const value = Array.isArray(query[key]) ? query[key][1] : query[key];
    comparators.push([key, logicalOperator, value]);
  });

  const withFragments = $with.map(subQuery => whereFragment(subQuery));
  const withoutFragments = $without.map(subQuery => whereFragment(subQuery));

  const queryStrings = [];
  const values = [];

  comparators.forEach((comparator: PersistMatcherTransitionalType) => {
    queryStrings.push(comparatorToString(comparator));
    values.push(comparator[2]);
  });

  notComparators.forEach((comparator: PersistMatcherTransitionalType) => {
    queryStrings.push("AND NOT (" + comparatorToString(comparator) + ")");
    values.push(comparator[2]);
  });

  // Build the first part of the query
  let queryString = queryStrings.join(` ${comparator} `);

  const withStrings = [];
  withFragments.forEach((statement: SqlStatement) => {
    withStrings.push("(" + statement.query + ")");
    values.push(...statement.values);
  });

  // Add our with strings
  if (withStrings.length)
    queryString += " AND (" + withStrings.join(" AND ") + ")";

  const withoutStrings = [];
  withoutFragments.forEach((statement: SqlStatement) => {
    withoutStrings.push("(" + statement.query + ")");
    values.push(...statement.values);
  });

  // Add our without strings
  if (withoutStrings.length)
    queryString += " AND NOT (" + withoutStrings.join(" OR ") + ")";

  return {
    query: queryString,
    values
  };
}
