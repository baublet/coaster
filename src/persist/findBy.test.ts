import { db, createTableForNewModelFactory } from "testHelpers/db";
import { User } from "testHelpers/User";

import { createFactory } from "./create";
import { connect } from "./connect";

it("returns a function", () => {
  const factory = createFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

it("finds a model by id: id", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const newUser = await User.create(user);
  const foundUser = await User.findBy({ id: newUser.id });

  expect(foundUser.toJson()).toEqual(newUser.toJson());
});

it("finds a model by name", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const newUser = await User.create(user);
  const foundUser = await User.findBy({ name: "Burt" });

  expect(foundUser.toJson()).toEqual(newUser.toJson());
});
