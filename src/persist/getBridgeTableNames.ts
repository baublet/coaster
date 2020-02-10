import { ModelFactoryWithPersist } from "model/types";

/**
 * Returns the names we need for simple bridge tables.
 * @param a First column
 * @param b Second column
 * @param bridgeTableName If undefined, will use "fromName_toName_relationships"
 */
export function getBridgeTableNames(
  a: ModelFactoryWithPersist,
  b: ModelFactoryWithPersist,
  bridgeTableName?: string
) {
  // By design, we have to alphabetize these. The only issue here is that if
  // developers rename tables without specifying bridge table names, auto-
  // generated bridge table names may change.

  const aColumn = `${a.names.safe}_id`;
  const bColumn = `${b.names.safe}_id`;
  const columns = [a.names.safe, b.names.safe];
  columns.sort();
  const table = bridgeTableName
    ? bridgeTableName
    : `${columns[0]}_${columns[1]}_relationships`;

  return [table, aColumn, bColumn];
}
