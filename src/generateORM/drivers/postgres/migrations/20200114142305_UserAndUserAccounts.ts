import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.comment("Users can have multiple accounts");
    table.text("id").primary();
    table.timestamps(undefined, true);
  });

  await knex.schema.createTable("userAccounts", (table) => {
    table.comment("UserAccount table comment");
    table.unique(["source", "uniqueIdentifier", "userId"]);
    table.text("id").primary();
    table.timestamps(undefined, true);
    table
      .enu("source", ["github", "bitbucket"], {
        useNative: true,
        enumName: "source",
      })
      .notNullable()
      .index();
    table.text("uniqueIdentifier").notNullable().index();
    table
      .text("userId")
      .notNullable()
      .index()
      .comment("Users can have multiple accounts")
      .references("id")
      .inTable("users");
    table.jsonb("rawUserData");
  });
}

export async function down(): Promise<void> {}
