import { db, createTableForNewModelFactory } from "testHelpers/db";

import { createFactory } from "./create";
import { connect } from "./connect";
import { User } from "testHelpers/User";

it("returns a function", () => {
  const factory = createFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

it("deletes a model", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const newUser = await User.create(user);

  const originalCount = await User.count();
  await User.delete(newUser);
  const newCount = await User.count();

  expect(newCount).toBeLessThan(originalCount);
});

it("returns a boolean if a model is deleted by id", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const savedUser = await User.create(user);
  const toDelete = await User.delete(savedUser.id);

  expect(toDelete).toBeTruthy();
});

it("returns a boolean if a model is deleted by model", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });
  const savedUser = await User.create(user);
  const toDelete = await User.delete(savedUser);

  expect(toDelete).toBeTruthy();
});
