import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createDeleteFunction } from "./delete";

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

it("creates and persists an entity", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const deleteFn = createDeleteFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  // Insert the records
  const toDelete = await connection
    .insert({ name: "Name", active: false })
    .into(tables["TestObject"]);

  await deleteFn(toDelete[0]);

  const resultsAfterDelete = await connection
    .select("*")
    .from(tables["TestObject"])
    .where({ id: toDelete[0] });

  expect(resultsAfterDelete).toEqual([]);
});

it("deletes multiples", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const deleteFn = createDeleteFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  // Insert the records
  const object1 = await connection
    .insert({ name: "Object 1", active: false })
    .into(tables["TestObject"]);
  const object2 = await connection
    .insert({ name: "Object 2", active: false })
    .into(tables["TestObject"]);
  const object3 = await connection
    .insert({ name: "Object 3", active: true })
    .into(tables["TestObject"]);

  await deleteFn([object1[0], object2[0], object3[0]]);

  const resultsAfterDelete = await connection
    .from(tables["TestObject"])
    .count("*");

  expect(resultsAfterDelete).toEqual([{ "count(*)": 0 }]);
});
