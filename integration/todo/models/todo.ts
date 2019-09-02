import createModel from "model/createModel";
import { propertyIsTruthy } from "model/validate";
import { SchemaNodeType } from "model/schema";
import persist from "../persist";

export default createModel({
  name: "Todo",
  validators: [propertyIsTruthy("todo")],
  schema: {
    todo: SchemaNodeType.STRING,
    complete: SchemaNodeType.BOOLEAN
  },
  persistWith: persist
});
