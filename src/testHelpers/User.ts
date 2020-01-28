import { db } from "./db";
import { createModel } from "model";
import { connect } from "persist/connect";

const persist = connect(db);

export const User = createModel({
  name: "User",
  persistWith: persist
});
