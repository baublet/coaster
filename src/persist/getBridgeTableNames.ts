import {
  ModelFactoryWithPersist,
  ModelHasArguments,
  ModelFactory
} from "model/types";

/**
 * Returns the names we need for simple bridge tables.
 * @param a First column
 * @param b Second column
 * @param bridgeTableName If undefined, will use "fromName_toName_relationships"
 */
export function getBridgeTableNames(
  a: ModelFactoryWithPersist,
  b: ModelFactoryWithPersist,
  bridgeTable?: ModelHasArguments
) {
  // By design, we have to alphabetize these. The only issue here is that if
  // developers rename tables without specifying bridge table names, auto-
  // generated bridge table names may change.

  let aColumn: string = `${a.names.safe}_${a.primaryKey}`;
  let bColumn: string = `${b.names.safe}_${b.primaryKey}`;

  const columns = [a.names.safe, b.names.safe];
  columns.sort();

  let table: string = `${columns[0]}_${columns[1]}_relationships`;

  if (bridgeTable) {
    if (bridgeTable.localKey) aColumn = bridgeTable.localKey;
    if (bridgeTable.foreignKey) bColumn = bridgeTable.foreignKey;
    if (bridgeTable.through) table = bridgeTable.through.tableName;
    if (bridgeTable.bridgeTableName) table = bridgeTable.bridgeTableName;
  }

  return [table, aColumn, bColumn];
}
