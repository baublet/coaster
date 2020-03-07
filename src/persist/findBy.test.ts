import { db, createTableForNewModelFactory } from "testHelpers/db";
import { User } from "testHelpers/User";

import { Model } from "model/types";
import { createFactory } from "./create";
import { connect } from "./connect";
import { PersistedModelFactory } from "./types";

jest.mock("./loadRelationships");

it("returns a function", () => {
  const factory = createFactory(User);
  expect(factory).toBeInstanceOf(Function);
});

async function setup(): Promise<[PersistedModelFactory, Model[]]> {
  const persist = connect(db);
  const { factory: User, model: user } = await createTableForNewModelFactory(
    persist,
    {
      name: "Anil",
      company: 1
    }
  );

  const users = await Promise.all([
    User.create(user),
    User.create({ name: "Alice", company: 1 }),
    User.create({ name: "Mei", company: 2 }),
    User.create({ name: "Fahad", company: 1 }),
    User.create({ name: "Jane", company: 2 }),
    User.create({ name: "Sandy", company: 5 })
  ]);
  return [User, users];
}

it("find models by a single field", async () => {
  const [User] = await setup();
  const foundUsers = await User.findBy({ company: 2 });

  expect(foundUsers.length).toBe(2);
  expect(foundUsers[0].company).toBe(2);
});

describe("query options", () => {
  async function setup(): Promise<[PersistedModelFactory, Model[]]> {
    const persist = connect(db);
    const { factory: User, model: user } = await createTableForNewModelFactory(
      persist,
      {
        name: "Anil",
        employeeId: 1,
        company: 1
      }
    );

    const users: ReturnType<typeof User>[] = await Promise.all([
      User.create(user),
      User.create(User({ name: "Alice", employeeId: 2, company: 1 })),
      User.create(User({ name: "Mei", employeeId: 3, company: 1 })),
      User.create(User({ name: "Fahad", employeeId: 4, company: 1 })),
      User.create(User({ name: "Jane", employeeId: 5, company: 1 })),
      User.create(User({ name: "Sandy", employeeId: 21, company: 1 }))
    ]);
    return [User, users];
  }

  it("orders properly: default/asc", async () => {
    const [User] = await setup();
    const foundUsers = await User.findBy(
      { company: 1 },
      {
        order: [{ by: "employeeId" }]
      }
    );
    expect(foundUsers.map(user => user.employeeId)).toEqual([
      1,
      2,
      3,
      4,
      5,
      21
    ]);
  });

  it("orders properly: desc", async () => {
    const [User] = await setup();
    const foundUsers = await User.findBy(
      { company: 1 },
      {
        order: [{ by: "employeeId", direction: "desc" }]
      }
    );
    expect(foundUsers.map(user => user.employeeId)).toEqual([
      21,
      5,
      4,
      3,
      2,
      1
    ]);
  });

  it("selects only certain columns", async () => {
    const [User, users] = await setup();
    const foundUser = await User.find(users[0].id, { columns: ["employeeId"] });
    expect(foundUser.toJson()).toEqual({ employeeId: 1 });
  });
});

it("loads eagerly if you ask for it to", async () => {
  const eagerMock = require("./loadRelationships").loadRelationships;
  const [User] = await setup();
  await User.findBy({ company: 2 }, { eager: true });

  expect(eagerMock).toHaveBeenCalled();
});
