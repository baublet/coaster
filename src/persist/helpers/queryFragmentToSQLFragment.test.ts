import queryFragmentToSQL from "./queryFragmentToSQLFragment";
import createModel from "model/createModel";
import { PersistMatcherType, PersistSortDirection } from "persist";

const userModel = createModel({
  name: "user"
});

it("converts a simple fragment to sql", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 3
  });
  expect(sqlParts).toEqual({
    where: "`id` = 3"
  });
});

it("uses logical clauses properly - AND", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    $and: true,
    id: 3,
    name: "Bob"
  });
  expect(sqlParts).toEqual({
    where: "`id` = 3 AND `name` = 'Bob'"
  });
});

it("uses logical clauses properly - OR", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    $or: true,
    id: 3,
    name: "Bob"
  });
  expect(sqlParts).toEqual({
    where: "`id` = 3 OR `name` = 'Bob'"
  });
});

it("converts a BETWEEN fragment", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: [PersistMatcherType.BETWEEN, [1, 2]]
  });
  expect(sqlParts).toEqual({
    where: "`id` BETWEEN 1 AND 2"
  });
});

it("converts with fragments", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 1,
    $with: {
      name: "Amy"
    }
  });
  expect(sqlParts).toEqual({
    where: "`id` = 1 AND (`name` = 'Amy')"
  });
});

it("converts without fragments", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 1,
    $without: {
      name: "Amy"
    }
  });
  expect(sqlParts).toEqual({
    where: "`id` = 1 AND NOT (`name` = 'Amy')"
  });
});

it("converts with and without fragments", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 1,
    $without: {
      name: "Thomas"
    },
    $with: [
      {
        groupId: "2"
      },
      { color: "purple" }
    ]
  });
  expect(sqlParts).toEqual({
    where:
      "`id` = 1 AND (`groupId` = '2', `color` = 'purple') AND NOT (`name` = 'Thomas')"
  });
});

it("converts sorting, limits, and offsets", () => {
  const sqlParts = queryFragmentToSQL({
    $model: userModel,
    id: 1,
    $limit: 10,
    $offset: 10,
    $sort: [
      {
        property: "id",
        direction: PersistSortDirection.ASC
      }
    ]
  });
  expect(sqlParts).toEqual({
    where: "`id` = 1",
    limit: 10,
    offset: 10,
    sort: "id ASC"
  });
});
