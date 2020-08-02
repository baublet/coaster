import { generateTypes } from "./generateTypes";
import { generateNames } from "helpers/generateNames";
import { SchemaNodeType } from "schema";

it("generates a type", () => {
  expect(
    generateTypes({
      schema: {
        name: "Test schema",
        description: "A schema for an application",
        nodes: [
          {
            names: generateNames("user"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              name: SchemaNodeType.STRING,
              active: SchemaNodeType.BOOLEAN,
              jobTitle: {
                type: SchemaNodeType.STRING,
                nullable: true
              }
            }
          },
          {
            names: generateNames("post"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              createdDate: SchemaNodeType.NUMBER,
              modifiedDate: SchemaNodeType.NUMBER,
              title: SchemaNodeType.STRING,
              content: SchemaNodeType.STRING
            }
          }
        ]
      }
    })
  ).toMatchSnapshot();
});
