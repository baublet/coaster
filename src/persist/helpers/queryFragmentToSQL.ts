import { PersistQuery } from "persist";
import sqlstring from "sqlstring";

interface SQLQueryParts {
  table: string;
  where: string;
}

export default function queryToSQL({
  $and = true,
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
}
