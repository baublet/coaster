import { generatePrimitiveTypes } from "./generatePrimitiveTypes";
import { generateNames } from "helpers/generateNames";
import { SchemaNodeType } from "primitive/schema";

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
    Object {
      "compiledTypes": "interface User {
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
    }",
      "schema": Object {
        "description": "A schema for an application",
        "entities": Array [
          Object {
            "names": Object {
              "camel": "user",
              "canonical": "user",
              "original": "user",
              "originalPlural": "users",
              "pascal": "User",
              "plural": "users",
              "pluralSafe": "users",
              "safe": "user",
            },
            "nodes": Object {
              "active": "boolean",
              "id": "number",
              "jobTitle": Object {
                "nullable": true,
                "type": "string",
              },
              "name": "string",
              "rawTest": Object {
                "definition": "Partial<{}>",
                "type": "raw",
              },
            },
          },
          Object {
            "names": Object {
              "camel": "post",
              "canonical": "post",
              "original": "post",
              "originalPlural": "posts",
              "pascal": "Post",
              "plural": "posts",
              "pluralSafe": "posts",
              "safe": "post",
            },
            "nodes": Object {
              "authors": Object {
                "of": "number",
                "type": "array",
              },
              "content": "string",
              "createdDate": "number",
              "id": "number",
              "modifications": Object {
                "nullable": true,
                "of": "number",
                "type": "array",
              },
              "modifiedDate": "number",
              "title": "string",
            },
          },
        ],
        "name": "Test schema",
      },
    }
  `);
});
