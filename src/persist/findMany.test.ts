import { db, createTableForNewModelFactory } from "testHelpers/db";
import { User } from "testHelpers/User";

import { findManyFactory } from "./findMany";
import { connect } from "./connect";

it("returns a function", () => {
  const factory = findManyFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

it("finds models by IDs", async () => {
  const persist = connect(db);
  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });

  const user1 = await User.create(user);
  const user2 = await User.create(user);
  await User.create({ name: "Ted" });

  const foundUsers = await User.findMany([user1.id, user2.id]);

  expect(JSON.stringify(foundUsers)).toEqual(1);
});
