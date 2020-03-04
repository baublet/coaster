import { db } from "./db";
import { connect } from "persist/connect";
import { ModelArgsPropertyType } from "model/types";
import { createPersistedModel } from "persist/createPersistedModel";

const persist = connect(db);

export const User = createPersistedModel({
  name: "User",
  properties: {
    id: {
      type: ModelArgsPropertyType.STRING
    },
    name: {
      type: ModelArgsPropertyType.STRING
    }
  },
  persist: { with: persist }
});
