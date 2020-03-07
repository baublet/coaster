import { database } from "../persist";
import { createPersistedModel } from "persist";
import { CoasterPropertyType } from "model";
import Todo from "./todo";

export default createPersistedModel({
  name: "User",
  properties: {
    name: {
      type: CoasterPropertyType.STRING
    },
    todos: {
      type: CoasterPropertyType.RELATIONSHIP,
      modelFactory: Todo
    }
  },
  persist: {
    with: database
  }
});
