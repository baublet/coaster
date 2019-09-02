import { PersistQuery, PersistMatcherType } from "persist";
import sqlString from "sqlstring";

interface SQLQueryParts {
  table: string;
  where: string;
}

export default function queryToSQL({
  $and = false,
  $limit = undefined,
  $model,
  $offset = 0,
  $or = false,
  $sort = [],
  $with = [],
  $without = [],
  ...attributes
}: PersistQuery): SQLQueryParts {
  const table = $model.schema.$tableName;
  const joinClause = $or ? " OR " : " AND ";
  const mainNodes = Object.keys(attributes)
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
    .join(joinClause);
  return {
    table,
    where: mainNodes
  };
}
