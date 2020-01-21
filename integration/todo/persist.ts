import { connect } from "persist";

export const database = connect({
  client: "sqlite3",
  connection: {
    filename: ":memory"
  }
});
