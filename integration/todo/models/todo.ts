import createModel from "model/createModel";
import { propertyIsTruthy } from "model/validate";
import persist from "../persist";

export default createModel({
  name: "Todo",
  validators: [propertyIsTruthy("todo")],
  persistWith: persist
});
