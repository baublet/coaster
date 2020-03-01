import { db } from "./db";
import { createModel } from "model";
import { connect } from "persist/connect";
import { ModelArgsPropertyType } from "model/types";

const persist = connect(db);

export const User = createModel({
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
