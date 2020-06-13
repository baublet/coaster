import { compileArray, compileObject } from "./compile";
import { SchemaNodeType } from "./types";

describe("arrays", () => {
  it("compiles an array properly: simple", () => {
    expect(
      compileArray({
        type: SchemaNodeType.ARRAY,
        of: SchemaNodeType.NUMBER
      })
    ).toEqual(`(number)[]`);
  });

  it("compiles an array properly: multiple primitives", () => {
    expect(
      compileArray({
        type: SchemaNodeType.ARRAY,
        of: [
          SchemaNodeType.NUMBER,
          SchemaNodeType.STRING,
          SchemaNodeType.BOOLEAN
        ]
      })
    ).toEqual(`(number | string | boolean)[]`);
  });

  it("compiles an array properly: array of objects", () => {
    expect(
      compileArray({
        type: SchemaNodeType.ARRAY,
        of: [{ name: "ObjectName", type: SchemaNodeType.OBJECT }]
      })
    ).toEqual(`(ObjectName)[]`);
  });
});

describe("objects", () => {
  it("compiles simple object properties", () => {
    expect(
      compileObject({
        name: "TestName",
        type: SchemaNodeType.OBJECT,
        nodes: {
          test: {
            type: SchemaNodeType.STRING
          }
        }
      })
    ).toEqual(
      `/**\n * TestName\n */\nexport interface TestName {\n  test: string;\n};`
    );
  });

  it("compiles object pointer properties", () => {
    expect(
      compileObject({
        name: "TestName",
        type: SchemaNodeType.OBJECT,
        nodes: {
          test: {
            type: SchemaNodeType.OBJECT,
            name: "TestNode"
          }
        }
      })
    ).toEqual(
      `/**\n * TestName\n */\nexport interface TestName {\n  test: TestNode;\n};`
    );
  });

  it("compiles object properties with descriptions", () => {
    expect(
      compileObject({
        name: "TestName",
        type: SchemaNodeType.OBJECT,
        description: "Description here",
        nodes: {
          test: {
            type: SchemaNodeType.OBJECT,
            description: "Another description here!",
            name: "TestNode"
          }
        }
      })
    ).toEqual(
      `/**\n * TestName\n * Description here\n */\nexport interface TestName {\n  /**\n   * Another description here!\n   */\n  test: TestNode;\n};`
    );
  });
});
