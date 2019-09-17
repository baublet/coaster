import createModel, { many } from "model/createModel";
import { propertyIsNotEmpty } from "model/validate";
import persistWith from "../persist";
import todo from "./todo";

export default createModel({
  name: "User",
  validators: [propertyIsNotEmpty("name")],
  has: [many(todo)],
  persistWith
});
