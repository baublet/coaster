import { createTypes, SchemaNodeType } from "./createTypes";
import { generateNames } from "helpers/generateNames";

it("generates a full schema", () => {
  expect(
    createTypes({
      schema: {
        name: "Test Schema!",
        description: "Description of the schema",
        entities: [
          {
            names: generateNames("user"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              username: SchemaNodeType.STRING,
              profile: {
                type: SchemaNodeType.ONE_TO_ONE,
                of: "Profile"
              }
            }
          },
          {
            names: generateNames("profile"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              preferredName: {
                type: SchemaNodeType.STRING,
                nullable: true
              },
              location: {
                type: SchemaNodeType.STRING,
                nullable: true
              }
            }
          }
        ]
      }
    })
  ).toMatchInlineSnapshot(`
    "interface Profile {
      id: number;
      preferredName?: string;
      location?: string;
    }

    interface NormalizedUser {
      id: number;
      username: string;
      profileId: number;
    }

    interface User {
      id: number;
      username: string;
      profile: Profile;
    }"
  `);
});
