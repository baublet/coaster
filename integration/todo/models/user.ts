import { database } from "../persist";
import { createPersistedModel } from "persist/createPersistedModel";
import { ModelArgsPropertyType } from "model/types";

export default createPersistedModel({
  name: "User",
  properties: {
    name: {
      type: ModelArgsPropertyType.STRING
    }
  },
  persist: {
    with: database
  }
});
