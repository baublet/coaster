import buildSchema from "persist/schema";

let schema;

beforeEach(() => {
  schema = buildSchema();
  schema.createDatabase("test");
});

it("creates a table properly", () => {
  schema.database("test").createTable("hats");
});
