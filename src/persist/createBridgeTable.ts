import { ModelFactoryWithPersist } from "model/types";
import { getBridgeTableNames } from "./getBridgeTableNames";

/**
 * Creates a bridge table to establish a relationship between two models. This
 * function is handy for internal testing and downstream in migrations.
 * @param from
 * @param to
 * @param bridgeTableName If undefined, will use "fromName_toName_relationships"
 */
export async function createBridgeTable(
  from: ModelFactoryWithPersist,
  to: ModelFactoryWithPersist,
  bridgeTableName?: string
) {
  const persist = to.persistWith;
  const [table, fromColumn, toColumn] = getBridgeTableNames(from, to);

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
      .references("id")
      .inTable(from.tableName);

    table
      .bigInteger(toColumn)
      .unsigned()
      .notNullable()
      .index();

    table
      .foreign(toColumn)
      .references("id")
      .inTable(to.tableName);
  });

  return [table, fromColumn, toColumn];
}
