import { PersistedModelFactory, PersistConnection } from "./types";

/**
 * Returns the names we need for simple bridge tables.
 * @param a First column
 * @param b Second column
 * @param bridgeTableName If undefined, will use "fromName_toName_relationships"
 */
export function getBridgeTableNames(
  a: PersistedModelFactory,
  b: PersistedModelFactory,
  bridgeTableName?: string
): [string, string, string, PersistConnection] {
  // By design, we have to alphabetize these. The only issue here is that if
  // developers rename tables without specifying bridge table names, auto-
  // generated bridge table names may change.
  const aName = a.$names.safe;
  const aPrimaryKey = a.$options.persist.primaryKey;
  const bName = b.$names.safe;
  const bPrimaryKey = b.$options.persist.primaryKey;

  const aColumn: string = `${aName}_${aPrimaryKey}`;
  const bColumn: string = `${bName}_${bPrimaryKey}`;

  const columns = [aName, bName];
  columns.sort();

  const persists = [a.$name, b.$name];
  persists.sort();
  const defaultPersist =
    persists[0] === a.$name ? a.$options.persist.with : b.$options.persist.with;

  const table: string =
    bridgeTableName || `${columns[0]}_${columns[1]}_relationships`;

  return [table, aColumn, bColumn, defaultPersist];
}
