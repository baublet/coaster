import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";

import { createDeleteWhereFunction } from "./deleteWhere";

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

it("deletes an entity by a constrainer", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);
  const deleteWhereFn = createDeleteWhereFunction<TestObject, TestObject>({
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

  await deleteWhereFn((qb) => qb.where({ active: false }));

  const resultsAfterDelete = await connection
    .from(tables["TestObject"])
    .count("*");

  expect(resultsAfterDelete).toEqual([{ "count(*)": 1 }]);
});
