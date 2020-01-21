import { createModel, many, Model } from "model/createModel";
import { propertyIsNotEmpty } from "model/validate";
import { database } from "../persist";
import todo, { Todo } from "./todo";

export interface User {
  name: string;
  todos?: Model<Todo>[];
}

export default createModel<User>({
  name: "User",
  validators: [propertyIsNotEmpty("name")],
  has: [many(todo)],
  persistWith: database
});
