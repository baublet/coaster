import { generatePrimitiveTypes } from "./generatePrimitiveTypes";
import { generateNames } from "helpers/generateNames";
import { SchemaNodeType } from "schema/primitive/schema";

it("generates types from a schema", () => {
  expect(
    generatePrimitiveTypes({
      schema: {
        name: "Test schema",
        description: "A schema for an application",
        entities: [
          {
            names: generateNames("user"),
            nodes: {
              id: SchemaNodeType.NUMBER,
              name: SchemaNodeType.STRING,
              active: SchemaNodeType.BOOLEAN,
              rawTest: {
                type: SchemaNodeType.RAW,
                definition: "Partial<{}>"
              } as any,
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
              content: SchemaNodeType.STRING,
              authors: {
                type: SchemaNodeType.ARRAY,
                of: SchemaNodeType.NUMBER
              },
              modifications: {
                type: SchemaNodeType.ARRAY,
                of: SchemaNodeType.NUMBER,
                nullable: true
              }
            }
          }
        ]
      }
    })
  ).toMatchInlineSnapshot(`
    "interface User {
      id: number;
      name: string;
      active: boolean;
      rawTest: Partial<{}>;
      jobTitle?: string;
    }

    interface Post {
      id: number;
      createdDate: number;
      modifiedDate: number;
      title: string;
      content: string;
      authors: number[];
      modifications?: number[];
    }"
  `);
});
