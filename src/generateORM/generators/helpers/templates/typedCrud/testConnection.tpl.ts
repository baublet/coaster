const connection = knex($$testConnectionString);

const testMigrations: ((...args: any[]) => Promise<void>)[] = [];

beforeAll(async () => {
  for(const migration of testMigrations) {
    await connection.transaction(trx => migration(trx));
  }
});

afterAll(async () => {
  await connection.destroy();
});
