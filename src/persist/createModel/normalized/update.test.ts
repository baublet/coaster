import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createUpdateFunction } from "./update";

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

it("updates an entity: model as only argument", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const update = createUpdateFunction<TestObject, TestObject>({
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

  const [objectToChange] = await connection
    .select("*")
    .from(tables["TestObject"])
    .where({ name: "Object 1" })
    .limit(1);

  objectToChange.active = 1;
  objectToChange.name = "Changed Object Name";
  const updatedObject = await update(objectToChange);

  expect(updatedObject).toEqual(objectToChange);
});

it("updates an entity: id and partial data", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const update = createUpdateFunction<TestObject, TestObject>({
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

  const updatedObject = await update(1, { name: "Changed Object" });
  const [row] = await connection
    .select("*")
    .from(tables["TestObject"])
    .where({ id: 1 })
    .limit(1);

  expect(updatedObject).toEqual(row);
  expect(updatedObject.name).toEqual("Changed Object");
  expect(row.name).toEqual("Changed Object");
});
