import queryFragmentToSQL from "./queryFragmentToSQLFragment";
import createModel from "model/createModel";
import { PersistMatcherType } from "persist";

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
    where: "`id` = 3"
  });
});

it("uses join clauses properly - AND", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    $and: true,
    id: 3,
    name: "Bob"
  });
  expect(sqlParts).toEqual({
    table: "user",
    where: "`id` = 3 AND `name` = 'Bob'"
  });
});

it("uses join clauses properly - OR", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    $or: true,
    id: 3,
    name: "Bob"
  });
  expect(sqlParts).toEqual({
    table: "user",
    where: "`id` = 3 OR `name` = 'Bob'"
  });
});

it("converts a BETWEEN fragment", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: [PersistMatcherType.BETWEEN, [1, 2]]
  });
  expect(sqlParts).toEqual({
    table: "user",
    where: "`id` BETWEEN 1 AND 2"
  });
});
