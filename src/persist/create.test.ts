import { User } from "testHelpers/User";

import { createFactory } from "./create";
import { connect } from "persist";
import { db, createTableForNewModelFactory } from "testHelpers/db";

it("returns a function", () => {
  const factory = createFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

it("creates a model", async () => {
  const persist = connect(db);

  const { factory: User, model: user } = await createTableForNewModelFactory(
    persist,
    {
      name: "Burt"
    }
  );

  const originalCount = await User.count();
  await User.create(user);
  const newCount = await User.count();

  expect(newCount).toBeGreaterThan(originalCount);
});

it("returns a model with an ID after creating it", async () => {
  const persist = connect(db);

  const { factory: User, model: user } = await createTableForNewModelFactory(
    persist,
    {
      name: "Burt"
    }
  );

  const newUser = await User.create(user);

  expect(newUser.id).toBeTruthy();
});
