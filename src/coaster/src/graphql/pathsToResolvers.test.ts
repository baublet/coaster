import { expect, it } from "@baublet/coaster-unit-test";

import { pathsToResolvers } from "./pathsToResolvers";

it("returns resolver paths properly", async () => {
  await expect(
    pathsToResolvers({
      resolversPath: "/path/to/resolvers/",
      paths: [
        "/path/to/resolvers/Person/name.ts",
        "/path/to/resolvers/Person/age.ts",
        "/path/to/resolvers/Query/people.ts",
        "/path/to/resolvers/Query/people.test.ts",
      ],
      ignorePatterns: [/\.test\.ts$/],
    })
  ).resolves.toMatchInlineSnapshot(`
    {
      "Person": {
        "age": "/path/to/resolvers/Person/age.ts",
        "name": "/path/to/resolvers/Person/name.ts",
      },
      "Query": {
        "people": "/path/to/resolvers/Query/people.ts",
      },
    }
  `);
});
