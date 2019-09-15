import {
  PersistQuery,
  PersistMatcherType,
  PersistSortDirection
} from "persist";
import sqlString from "sqlstring";

interface SQLQueryParts {
  limit?: number;
  offset?: number;
  sort?: string;
  where: string;
}

export default function queryToSQL({
  $limit = undefined,
  $offset = 0,
  $or = false,
  $sort = [],
  $with = [],
  $without = [],
  ...attributes
}: PersistQuery): SQLQueryParts {
  const logicalClause = $or ? " OR " : " AND ";
  const mainNodes = Object.keys(attributes)
    // Filter out special query names
    .filter(columnName => columnName[0] !== "$")
    .map(column => {
      const escapedColumn = sqlString.escapeId(column);
      let value: string = "";
      let comparator: string = "=";

      if (Array.isArray(attributes[column])) {
        switch (attributes[column][0]) {
          case PersistMatcherType.EQUAL:
            comparator = "=";
            value = sqlString.escape(attributes[column][1]);
            break;
          case PersistMatcherType.NOT_EQUAL:
            comparator = "<>";
            value = sqlString.escape(attributes[column][1]);
            break;
          case PersistMatcherType.GREATER_THAN:
            comparator = ">";
            value = sqlString.escape(attributes[column][1]);
            break;
          case PersistMatcherType.LESS_THAN:
            comparator = "<";
            value = sqlString.escape(attributes[column][1]);
            break;
          case PersistMatcherType.ONE_OF:
            comparator = "IN";
            value =
              "(" +
              attributes[column][1]
                .map(value => sqlString.escape(value))
                .join(",") +
              ")";
            break;
          case PersistMatcherType.NOT_ONE_OF:
            comparator = "NOT IN";
            value =
              "(" +
              attributes[column][1]
                .map(value => sqlString.escape(value))
                .join(",") +
              ")";
            break;
          case PersistMatcherType.BETWEEN:
            comparator = "BETWEEN";
            value =
              sqlString.escape(attributes[column][1][0]) +
              " AND " +
              sqlString.escape(attributes[column][1][1]);
            break;
          case PersistMatcherType.NOT_BETWEEN:
            comparator = "NOT BETWEEN";
            value =
              sqlString.escape(attributes[column][1][0]) +
              " AND " +
              sqlString.escape(attributes[column][1][1]);
            break;
        }
      } else if (
        typeof attributes[column] === "string" ||
        typeof attributes[column] === "number"
      ) {
        comparator = "=";
        value = sqlString.escape(attributes[column]);
      }
      return `${escapedColumn} ${comparator} ${value}`;
    })
    .join(logicalClause);

  const fragment: SQLQueryParts = {
    where: mainNodes
  };

  if ($limit) {
    fragment.limit = $limit;
  }

  if ($offset) {
    fragment.offset = $offset;
  }

  if (!Array.isArray($sort)) $sort = [$sort];
  if ($sort.length > 0) {
    const sorts = $sort.map(sort => {
      const direction =
        sort.direction === PersistSortDirection.ASC ? "ASC" : "DESC";
      return `${sort.property} ${direction}`;
    });
    fragment.sort = sorts.join(", ");
  }

  // Process our recursive withs and withouts
  if (!Array.isArray($with)) $with = [$with];
  if (!Array.isArray($without)) $without = [$without];
  if ($with.length > 0) {
    const additionalWheres = $with.map(query => queryToSQL(query).where);
    fragment.where += " AND (";
    fragment.where += additionalWheres.join(", ");
    fragment.where += ")";
  }
  if ($without.length > 0) {
    const additionalWheres = $without.map(query => queryToSQL(query).where);
    fragment.where += " AND NOT (";
    fragment.where += additionalWheres.join(", ");
    fragment.where += ")";
  }

  return fragment;
}
