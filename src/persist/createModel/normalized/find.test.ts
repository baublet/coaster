import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createFindFunction } from "./find";

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

it("finds one and multiples", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const find = createFindFunction<TestObject, TestObject>({
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
  const ids = [object1[0], object2[0], object3[0]];

  await expect(find(ids[0])).resolves.toEqual({
    id: 1,
    name: "Object 1",
    active: 0,
  });

  await expect(find(ids)).resolves.toEqual([
    { active: 0, id: 1, name: "Object 1" },
    { active: 0, id: 2, name: "Object 2" },
    { active: 1, id: 3, name: "Object 3" },
  ]);
});
