import knex from "knex";

async function createDatabase() {
  const db = knex(require("../knexfile.js"));
  await db.raw(`CREATE SCHEMA public;`);
  await db.destroy();
}

createDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((reason) => {
    console.error("Error creating the database!");
    console.log(reason);
    process.exit(1);
  });
