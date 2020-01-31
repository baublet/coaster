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

it("finds multiple models by ID", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const newUser1 = await User.create(user);
  const newUser2 = await User.create(User({ name: "Alice" }));
  const foundUsers = await User.find([newUser1.id, newUser2.id]);

  expect(foundUsers[0].toJson()).toEqual(newUser1.toJson());
  expect(foundUsers[1].toJson()).toEqual(newUser2.toJson());
});
