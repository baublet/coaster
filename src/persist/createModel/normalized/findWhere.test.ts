import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createFindWhereFunction } from "./findWhere";

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
  const findWhere = createFindWhereFunction<TestObject, TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  // Insert the records
  await connection
    .insert({ name: "Object 1", active: false })
    .into(tables["TestObject"]);
  await connection
    .insert({ name: "Object 2", active: false })
    .into(tables["TestObject"]);
  await connection
    .insert({ name: "Object 3", active: true })
    .into(tables["TestObject"]);

  await expect(findWhere((qb) => qb.where({ active: true }))).resolves.toEqual([
    { active: 1, id: 3, name: "Object 3" },
  ]);
});
