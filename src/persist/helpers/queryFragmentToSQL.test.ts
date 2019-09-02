import queryFragmentToSQL from "./queryFragmentToSQL";
import createModel from "model/createModel";

const userModel = createModel({
  name: "user"
});

it("converts a simple fragment to sql", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 3
  });
  expect(sqlParts).toEqual({
    table: "user",
    where: "id = 3"
  });
});
