import { createSchema, Schema, SchemaNodeType } from "schema";

import { createTablesFromSchema } from "persist/helpers/createTablesFromSchema";
import { createTestConnection } from "persist/helpers/createTestConnection";
import { createModel } from "./createModel";

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

it("creates, reads, updates, and deletes: simple types", async () => {
  const connection = await createTestConnection();
  const [tables] = await createTablesFromSchema(connection, schema);

  const TestObject = createModel<TestObject>({
    schema,
    connection,
    entity: "TestObject",
    tableName: tables["TestObject"],
  });

  const created = await TestObject.create({
    name: "Test Name",
    active: false,
  });
  expect(created).toEqual({ active: 0, id: 1, name: "Test Name" });

  const found = await TestObject.find(1);
  expect(created).toEqual(found);

  const updated = await TestObject.update(1, { active: true });
  expect(updated).not.toEqual(found);
  expect(updated).toEqual({ active: 1, id: 1, name: "Test Name" });

  TestObject.delete(updated.id);
  const foundAfterDeleted = await TestObject.find(1);
  expect(foundAfterDeleted).toBeFalsy();
});
