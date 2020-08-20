import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createCreateFunction } from "./create";

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
  const create = createCreateFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  const createdObject = await create({ name: "Name", active: true });
  const persistedObject = await connection
    .select("*")
    .from(tables["TestObject"])
    .where({ id: createdObject.id });

  expect(createdObject).toEqual(persistedObject[0]);
});

it("creates and persists multiple entities", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const create = createCreateFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  await create([
    { name: "Object 1", active: true },
    { name: "Object 2", active: true },
  ]);

  const results = await connection.from(tables["TestObject"]).count("*");

  expect(results).toEqual([{ "count(*)": 2 }]);
});
