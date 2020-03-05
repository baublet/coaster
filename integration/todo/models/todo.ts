import { database } from "../persist";
import { createPersistedModel } from "persist/createPersistedModel";
import { ModelArgsPropertyType } from "model/types";

import User from "./user";

export interface Todo {
  todo: string;
  userId?: string;
}

export default createPersistedModel({
  name: "Todo",
  properties: {
    todo: {
      type: ModelArgsPropertyType.STRING
    },
    user: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: User,
      many: false
    }
  },
  persist: {
    with: database
  }
});
