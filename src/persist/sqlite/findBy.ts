import {
  PersistSelectQuery,
  PersistSelectWithQuery,
  PersistSortType,
  PersistSortDirection
} from "persist";
import { Model } from "model/createModel";
import whereFragment from "persist/sql/whereFragment";

export default async function findBy({
  $model,
  $limit = 0,
  $offset = 0,
  $sort = [],
  ...query
}: PersistSelectQuery | PersistSelectWithQuery): Promise<Model[]> {
  const where = whereFragment(query);
  const limit = $limit > 0 ? `LIMIT ${$limit}` : "";
  const offset = $offset > 0 ? `OFFSET ${$offset}` : "";

  $sort = Array.isArray($sort) ? $sort : [$sort];
  const order =
    $sort.length === 0
      ? ""
      : "ORDER BY " +
        $sort
          .map((sort: PersistSortType) => {
            const dir =
              sort.direction === PersistSortDirection.ASC ? "ASC" : "DESC";
            return `${sort.property} ${dir}`;
          })
          .join(",");

  const tableName = $model.tableName;

  const fullQuery = `SELECT * FROM ${tableName} WHERE ${where} ${limit} ${offset} ${order}`;

  return [];
}
