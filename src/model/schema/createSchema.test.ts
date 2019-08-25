import createSchema from "./createSchema";
import { SchemaNodeType, schemaNodeDbOptionsDefaults } from ".";
import generateNames from "../../helpers/generateNames";

it("expands a simplified schema node", () => {
  expect(
    createSchema({
      name: SchemaNodeType.STRING
    })
  ).toBeInstanceOf(Object);
});

it("expands a simplified schema properly", () => {
  expect(
    createSchema({
      name: SchemaNodeType.STRING
    })
  ).toEqual({
    name: {
      names: generateNames("name"),
      relation: false,
      type: SchemaNodeType.STRING,
      uniqueName: "name",
      dbOptions: schemaNodeDbOptionsDefaults
    }
  });
});

it("expands a simplified model schema properly", () => {
  expect(
    createSchema({
      name: SchemaNodeType.MODEL
    })
  ).toEqual({
    name: {
      names: generateNames("name_id"),
      relation: true,
      type: SchemaNodeType.ID,
      uniqueName: "name",
      dbOptions: schemaNodeDbOptionsDefaults
    }
  });
});