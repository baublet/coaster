import buildSchema, { SchemaDatabase, SchemaTable } from ".";

it("converts to JSON properly", () => {
  const schema = buildSchema();
  const db: SchemaDatabase = schema.createDatabase("test");
  const table: SchemaTable = db.createTable("hats");
  table.createColumn("make");
  table.createColumn("model");
  table.createColumn("year");
  db.createIndex("hats", "idx_year", ["year"]);
  expect(JSON.stringify(schema.toTree())).toEqual(schema.toJSON());
  expect(schema.toTree()).toEqual({
    test: {
      _indexes: { idx_year: { columns: ["year"], table: "hats" } },
      hats: {
        createdDate: {
          autoIncrement: false,
          default: null,
          name: "createdDate",
          nullable: false,
          type: "BIGINT"
        },
        id: {
          autoIncrement: false,
          default: null,
          name: "id",
          nullable: false,
          type: "BIGINT"
        },
        make: {
          autoIncrement: false,
          default: null,
          name: "make",
          nullable: false,
          type: "TEXT"
        },
        model: {
          autoIncrement: false,
          default: null,
          name: "model",
          nullable: false,
          type: "TEXT"
        },
        modifiedDate: {
          autoIncrement: false,
          default: null,
          name: "modifiedDate",
          nullable: false,
          type: "BIGINT"
        },
        year: {
          autoIncrement: false,
          default: null,
          name: "year",
          nullable: false,
          type: "TEXT"
        }
      }
    }
  });
});
