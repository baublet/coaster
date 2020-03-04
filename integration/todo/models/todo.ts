import { database } from "../persist";
import { createPersistedModel } from "persist/createPersistedModel";
import { ModelArgsPropertyType } from "model/types";

export interface Todo {
  todo: string;
  userId?: string;
}

export default createPersistedModel({
  name: "Todo",
  properties: {
    todo: {
      type: ModelArgsPropertyType.STRING
    }
  },
  persist: {
    with: database
  }
});
