import { it, expect } from "@baublet/coaster-unit-test";

import { resolverPathsToResolvers } from "./resolverPathsToResolvers";

it("returns resolvers properly", () => {
  expect(
    resolverPathsToResolvers({
      getResolver: (path) => "resolverFor: " + path,
      resolverPaths: {
        Query: {
          somePath: "some/path/index.ts",
          someOtherPath: "some/other/path/index.ts",
        },
        Todo: {
          users: "todo/users.ts",
        },
        User: {
          todos: "user/todos.ts",
        },
      },
    })
  ).toMatchInlineSnapshot(`
    {
      "Query": {
        "someOtherPath": "resolverFor: some/other/path/index.ts",
        "somePath": "resolverFor: some/path/index.ts",
      },
      "Todo": {
        "users": "resolverFor: todo/users.ts",
      },
      "User": {
        "todos": "resolverFor: user/todos.ts",
      },
    }
  `);
});
