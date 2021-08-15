import knex from "knex";

async function dropDatabase() {
  const db = knex(require("../knexfile.js"));
  await db.raw(`DROP SCHEMA IF EXISTS public CASCADE;`);
  await db.destroy();
}

dropDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((reason) => {
    console.error("Error dropping the database!");
    console.log(reason);
    process.exit(1);
  });
