import { getTestColumnDefinitionForColumn } from "./getTestColumnDefinitionForColumn";

it("generates a column: nullable", () => {
  expect(
    getTestColumnDefinitionForColumn(
      {
        columnType: "test",
        foreignKeys: [],
        hasDefault: true,
        name: "name",
        nullable: true,
        type: "boolean",
        defaultTo: "false",
      },
      {
        primaryKeyColumn: "test",
        uniqueConstraints: [],
      }
    )
  ).toMatchInlineSnapshot(`
    "    table.boolean(\\"name\\").nullable().defaultTo(\\"false\\");
    "
  `);
});

it("generates a column: not nullable", () => {
  expect(
    getTestColumnDefinitionForColumn(
      {
        columnType: "test",
        foreignKeys: [],
        hasDefault: true,
        name: "name",
        nullable: false,
        type: "boolean",
        defaultTo: "false",
      },
      {
        primaryKeyColumn: "test",
        uniqueConstraints: [],
      }
    )
  ).toMatchInlineSnapshot(`
    "    table.boolean(\\"name\\").notNullable().defaultTo(\\"false\\");
    "
  `);
});

it("generates a column: unique constraints", () => {
  expect(
    getTestColumnDefinitionForColumn(
      {
        columnType: "test",
        foreignKeys: [],
        hasDefault: true,
        name: "name",
        nullable: false,
        type: "boolean",
        defaultTo: "false",
      },
      {
        primaryKeyColumn: "test",
        uniqueConstraints: [["name"]],
      }
    )
  ).toMatchInlineSnapshot(`
    "    table.boolean(\\"name\\").notNullable().defaultTo(\\"false\\").unique();
    "
  `);
});

it("generates a column: primary", () => {
  expect(
    getTestColumnDefinitionForColumn(
      {
        columnType: "test",
        foreignKeys: [],
        hasDefault: false,
        name: "name",
        nullable: false,
        type: "boolean",
      },
      {
        primaryKeyColumn: "name",
        uniqueConstraints: [["name"]],
      },
      "knex"
    )
  ).toMatchInlineSnapshot(`
    "    knex.boolean(\\"name\\").notNullable().unique();
        knex.primary([\\"name\\"]);
    "
  `);
});
