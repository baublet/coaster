import createSchema from "./createSchema";
import { SchemaNodeType } from ".";

it("expands a simplified schema node", () => {
  expect(createSchema({
    name: SchemaNodeType.STRING
  })).toBeInstanceOf(Object);
})