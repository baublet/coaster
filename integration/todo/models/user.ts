import { createModel, many } from "model/createModel";
import { Model } from "model/types";
import { propertyIsNotEmpty } from "model/validate";

import { database } from "../persist";
import todo, { Todo } from "./todo";

export interface User {
  name: string;
  firstName: string;
  fullName: string;
  lastName: string;
  todos: Model<Todo>[];
}

export default createModel<User>({
  name: "User",
  validators: [propertyIsNotEmpty("name")],
  has: [many(todo)],
  computedProps: {
    fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`
  },
  persistWith: database
});
