import createSchema from "./createSchema";
import { SchemaNodeType, schemaNodeDbOptionsDefaults } from ".";
import generateNames from "../../helpers/generateNames";
import createModel from "../createModel";

const testModel = createModel({
  name: "test"
});

it("expands a simplified schema node", () => {
  expect(
    createSchema({
      $tableName: "test",
      name: SchemaNodeType.STRING
    })
  ).toBeInstanceOf(Object);
});

it("expands a simplified schema properly", () => {
  expect(
    createSchema({
      $tableName: "test",
      name: SchemaNodeType.STRING
    })
  ).toEqual({
    $tableName: "test",
    name: {
      names: generateNames("name"),
      relation: false,
      type: SchemaNodeType.STRING,
      uniqueName: "name",
      persistOptions: schemaNodeDbOptionsDefaults("name")
    }
  });
});

it("expands a simplified model schema properly", () => {
  expect(
    createSchema({
      $tableName: "test",
      name: testModel
    })
  ).toEqual({
    $tableName: "test",
    name: {
      names: generateNames("name_id", "name"),
      model: testModel,
      relation: true,
      type: SchemaNodeType.ID,
      uniqueName: "name",
      persistOptions: schemaNodeDbOptionsDefaults("name")
    }
  });
});

it("throws an error when you don't pass a model to a model schema", () => {
  expect(() => {
    createSchema({
      $tableName: "test",
      name: {
        type: SchemaNodeType.MODEL
      }
    });
  }).toThrow();
});
