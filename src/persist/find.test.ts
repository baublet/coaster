import { db, createTableForNewModelFactory } from "testHelpers/db";
import { User } from "testHelpers/User";

import { findFactory } from "./find";
import { connect } from "./connect";
import { cannotFindByBlankId } from "./error/cannotFindBlankId";

it("returns a function", () => {
  const factory = findFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

it("throws if we find by falsy ID", async () => {
  const persist = connect(db);
  const [User] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });

  await expect(User.find("")).rejects.toEqual(cannotFindByBlankId());
});

it("finds a model by its ID", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const newUser = await User.create(user);
  const foundUser = await User.find(newUser.id);

  expect(foundUser.toJson()).toEqual(newUser.toJson());
});
