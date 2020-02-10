import { db } from "./db";
import { createModel } from "model";
import { connect } from "persist/connect";

const persist = connect(db);

export const User = createModel<{ id: string; name: string }>({
  name: "User",
  persistWith: persist
});
