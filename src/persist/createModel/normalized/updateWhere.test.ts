import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createUpdateWhereFunction } from "./updateWhere";

const schema: Schema = createSchema({
  entities: [
    {
      name: "TestObject",
      nodes: {
        id: SchemaNodeType.NUMBER,
        name: SchemaNodeType.STRING,
        active: SchemaNodeType.BOOLEAN,
      },
    },
  ],
});

interface TestObject {
  id: number;
  name: string;
  active: boolean;
}

it("creates and persists an entity: partial model", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const updateWhere = createUpdateWhereFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  await connection
    .insert({ name: "Object 1", active: false })
    .into(tables["TestObject"]);
  await connection
    .insert({ name: "Object 2", active: false })
    .into(tables["TestObject"]);
  await connection
    .insert({ name: "Object 3", active: true })
    .into(tables["TestObject"]);

  const updatedObject = await updateWhere(
    {
      name: "Updated Name!",
    },
    (qb) => qb.where({ active: false })
  );
  expect(updatedObject).toEqual(2);

  const inDatabase = await connection(tables["TestObject"])
    .select("name")
    .where({ active: false });
  expect(inDatabase).toEqual([
    { name: "Updated Name!" },
    { name: "Updated Name!" },
  ]);
});
