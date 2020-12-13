import { GraphQLSchema, graphql } from "graphql";

import { createSchema } from "./createSchema";

it("creates a schema properly", async () => {
  const schema = await createSchema({
    schemaDefinition: __dirname + "/testSchema.graphql",
  });

  expect(schema).toBeInstanceOf(GraphQLSchema);
});

it("creates an executable schema", async () => {
  const schema = await createSchema({
    schemaDefinition: __dirname + "/testSchema.graphql",
    resolvers: {
      Query: {
        test: () => "hello world!",
      },
    },
  });

  await expect(
    graphql({
      schema,
      source: "query { test }",
    })
  ).resolves.toEqual({ data: { test: "hello world!" } });
});
