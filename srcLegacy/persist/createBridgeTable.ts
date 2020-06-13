import { getBridgeTableNames } from "./getBridgeTableNames";
import { PersistedModelFactory } from "./types";

/**
 * Creates a bridge table to establish a relationship between two models. This
 * function is handy for internal testing and downstream in migrations.
 * @param from
 * @param to
 * @param bridgeTableName If undefined, will use "fromName_toName_relationships"
 */
export async function createBridgeTable(
  from: PersistedModelFactory,
  to: PersistedModelFactory,
  bridgeTableName?: string
) {
  const persist = to.$options.persist.with;
  const [table, fromColumn, toColumn] = getBridgeTableNames(
    from,
    to,
    bridgeTableName
  );
  const fromPrimaryKey = from.$options.persist.primaryKey;
  const toPrimaryKey = to.$options.persist.primaryKey;

  await persist.schema.createTable(table, table => {
    table
      .bigInteger("id")
      .unsigned()
      .primary()
      .unique()
      .index();

    table
      .bigInteger(fromColumn)
      .unsigned()
      .notNullable()
      .index();

    table
      .foreign(fromColumn)
      .references(fromPrimaryKey)
      .inTable(from.$options.persist.tableName);

    table
      .bigInteger(toColumn)
      .unsigned()
      .notNullable()
      .index();

    table
      .foreign(toColumn)
      .references(toPrimaryKey)
      .inTable(to.$options.persist.tableName);
  });

  return [table, fromColumn, toColumn];
}
