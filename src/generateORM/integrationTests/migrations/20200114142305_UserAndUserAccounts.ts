import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.text("id").primary();
    table.timestamps(undefined, true);
  });

  await knex.schema.createTable("userAccounts", (table) => {
    table.unique(["source", "uniqueIdentifier", "userId"]);
    table.text("id").primary();
    table.timestamps(undefined, true);
    table.text("source").notNullable().index();
    table.text("uniqueIdentifier").notNullable().index();
    table
      .text("userId")
      .notNullable()
      .index()
      .references("id")
      .inTable("users");
    table.jsonb("rawUserData");
  });
}

export async function down(): Promise<void> {}
