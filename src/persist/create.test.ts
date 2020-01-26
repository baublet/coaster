import { db, createTableForNewModelFactory } from "testHelpers/db";

import { createFactory } from "./create";
import { connect } from "./connect";
import { createModel } from "model";

it("returns a function", () => {
  const persist = connect(db);
  const factory = createFactory(
    createModel({
      name: "User",
      persistWith: persist
    })
  );
  expect(factory).toBeInstanceOf(Function);
});

it("creates a model", async () => {
  const persist = connect(db);

  const [User, user] = await createTableForNewModelFactory(persist, {
    name: "Burt"
  });

  const originalCount = await User.count();
  await User.create(user);
  const newCount = await User.count();

  expect(newCount).toBeGreaterThan(originalCount);
});
