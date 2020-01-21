import { createModel } from "model";
import { propertyIsNotEmpty } from "model/validate";
import { database } from "../persist";

export interface Todo {
  todo: string;
  userId?: string;
}

export default createModel<Todo>({
  name: "Todo",
  validators: [propertyIsNotEmpty("todo")],
  persistWith: database
});
