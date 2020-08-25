import { createSchema, SchemaNodeType } from "./createSchema";
import { generateNames } from "helpers/generateNames";

it("allows pre-formed generated names", () => {
  expect(
    createSchema({
      entities: [
        {
          name: "test",
          nodes: {
            id: SchemaNodeType.NUMBER,
          },
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    Object {
      "customTypes": Array [],
      "entities": Array [
        Object {
          "name": "test",
          "names": Object {
            "camel": "test",
            "camelPlural": "tests",
            "canonical": "Test",
            "original": "test",
            "originalPlural": "tests",
            "pascal": "Test",
            "pascalPlural": "Tests",
            "safe": "test",
            "safePlural": "tests",
            "snake": "test",
            "snakePlural": "tests",
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
            id: SchemaNodeType.NUMBER,
          },
        },
        {
          names: generateNames("test-again"),
          nodes: {
            id: SchemaNodeType.STRING,
          },
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    Object {
      "customTypes": Array [],
      "entities": Array [
        Object {
          "name": "test",
          "names": Object {
            "camel": "test",
            "camelPlural": "tests",
            "canonical": "Test",
            "original": "test",
            "originalPlural": "tests",
            "pascal": "Test",
            "pascalPlural": "Tests",
            "safe": "test",
            "safePlural": "tests",
            "snake": "test",
            "snakePlural": "tests",
          },
          "nodes": Object {
            "id": "number",
          },
        },
        Object {
          "names": Object {
            "camel": "testAgain",
            "camelPlural": "testAgains",
            "canonical": "TestAgain",
            "original": "test-again",
            "originalPlural": "test-agains",
            "pascal": "TestAgain",
            "pascalPlural": "TestAgains",
            "safe": "test_again",
            "safePlural": "test_agains",
            "snake": "test_again",
            "snakePlural": "test_agains",
          },
          "nodes": Object {
            "id": "string",
          },
        },
      ],
    }
  `);
});
