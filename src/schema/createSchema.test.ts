import { createSchema, SchemaNodeType } from "./createSchema";
import { generateNames } from "helpers/generateNames";

it("allows pre-formed generated names", () => {
  expect(
    createSchema({
      entities: [
        {
          name: "test",
          nodes: {
            id: SchemaNodeType.NUMBER
          }
        }
      ]
    })
  ).toMatchInlineSnapshot(`
    Object {
      "entities": Array [
        Object {
          "name": "test",
          "names": Object {
            "camel": "test",
            "canonical": "test",
            "original": "test",
            "originalPlural": "tests",
            "pascal": "Test",
            "plural": "tests",
            "pluralSafe": "tests",
            "safe": "test",
          },
          "nodes": Object {
            "id": "number",
          },
        },
      ],
    }
  `);
});

it("allows fully-formed names", () => {
  expect(
    createSchema({
      entities: [
        {
          name: "test",
          nodes: {
            id: SchemaNodeType.NUMBER
          }
        },
        {
          names: generateNames("test-again"),
          nodes: {
            id: SchemaNodeType.STRING
          }
        }
      ]
    })
  ).toMatchInlineSnapshot(`
    Object {
      "entities": Array [
        Object {
          "name": "test",
          "names": Object {
            "camel": "test",
            "canonical": "test",
            "original": "test",
            "originalPlural": "tests",
            "pascal": "Test",
            "plural": "tests",
            "pluralSafe": "tests",
            "safe": "test",
          },
          "nodes": Object {
            "id": "number",
          },
        },
        Object {
          "names": Object {
            "camel": "testAgain",
            "canonical": "test-again",
            "original": "test-again",
            "originalPlural": "test-agains",
            "pascal": "TestAgain",
            "plural": "test-agains",
            "pluralSafe": "test_agains",
            "safe": "test_again",
          },
          "nodes": Object {
            "id": "string",
          },
        },
      ],
    }
  `);
});
