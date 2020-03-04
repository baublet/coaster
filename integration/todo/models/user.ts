import { database } from "../persist";
import { createPersistedModel } from "persist";
import { CoasterPropertyType } from "model";

export default createPersistedModel({
  name: "User",
  properties: {
    name: {
      type: CoasterPropertyType.STRING
    }
  },
  persist: {
    with: database
  }
});
