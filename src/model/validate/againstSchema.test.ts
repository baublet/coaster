import againstSchema from "./againstSchema";
import createSchema from "model/schema/createSchema";
import { SchemaNodeType } from "model/schema";
import propertyIsNotOfValidType from "model/error/propertyIsNotOfValidType";

const schema = createSchema({
  $tableName: "test",
  name: {
    type: SchemaNodeType.STRING
  },
  messages: {
    type: SchemaNodeType.INT
  },
  cool: {
    type: SchemaNodeType.BOOLEAN
  },
  date: {
    type: SchemaNodeType.DATE
  }
});

const data = (overrides: Record<string, any> = {}) => ({
  name: "Name!",
  messages: 3,
  cool: true,
  date: 123,
  ...overrides
});

it("succeeds with all successful data types", () => {
  expect(againstSchema(data(), {}, schema)).toBe(true);
});

it("fails when expected with STRING type", () => {
  expect(againstSchema(data({ name: 123 }), {}, schema)[0]).toEqual(
    propertyIsNotOfValidType("name", "test", "string", "number")
  );
});

it("fails when expected with INT type", () => {
  expect(againstSchema({ messages: "Not gonna work" }, {}, schema)[0]).toEqual(
    propertyIsNotOfValidType("messages", "test", "number", "string")
  );
});

it("fails when expected with BOOLEAN type", () => {
  expect(
    againstSchema({ cool: "not gonna work, either" }, {}, schema)[0]
  ).toEqual(propertyIsNotOfValidType("cool", "test", "boolean", "string"));
});
