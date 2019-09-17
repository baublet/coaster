import createModel from "model/createModel";
import { propertyIsNotEmpty } from "model/validate";
import persistWith from "../persist";

export default createModel({
  name: "Todo",
  validators: [propertyIsNotEmpty("todo")],
  persistWith
});
