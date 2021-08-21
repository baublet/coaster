/**
 * To properly run this test, use `test:pg:implementation`
 */

import knex from "knex";

import {
  RawUsers,
  insertUser,
  insertUsers,
  UserInput,
  findUsers,
  findUserOrFail,
} from "./generated";

const connection = knex(require("./knexfile.js"));

afterAll(async () => {
  await connection.destroy();
});

describe("Layer 0: Raw DB query driver", () => {
  const testUserId = Date.now().toString();

  it("inserts a user", async () => {
    const created = await RawUsers(connection)
      .insert({ id: testUserId })
      .returning("*");
    await expect(created).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });

  it("reads a user", async () => {
    const created = await RawUsers(connection)
      .select("*")
      .where({ id: testUserId });
    await expect(created).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });

  it("updates a user", async () => {
    await RawUsers(connection)
      .where("id", "=", testUserId)
      .update({ id: testUserId + "yo" });

    const updated = await RawUsers(connection)
      .select("*")
      .where("id", "=", testUserId + "yo");

    await expect(updated).toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId + "yo",
        updated_at: expect.any(Date),
      },
    ]);

    await expect(
      RawUsers(connection)
        .where("id", "=", testUserId + "yo")
        .update({ id: testUserId })
        .returning("*")
    ).resolves.toEqual([
      {
        created_at: expect.any(Date),
        id: testUserId,
        updated_at: expect.any(Date),
      },
    ]);
  });

  it("deletes a user", async () => {
    const created = await RawUsers(connection)
      .insert({ id: Date.now().toString() + "test-user-id-2" })
      .returning("*");

    await RawUsers(connection).delete().where("id", "=", created[0].id);

    await expect(
      RawUsers(connection).select("*").where("id", "=", created[0].id)
    ).resolves.toEqual([]);
  });
});

describe("Layer 1: Named helpers", () => {
  describe("Users", () => {
    const userFixture: UserInput = {
      id: Date.now().toString() + "-test-2",
      createdAt: new Date("2021-04-02"),
      updatedAt: new Date("2021-05-03"),
    };

    it("insertUser inserts a single user", async () => {
      await expect(insertUser(userFixture, connection)).resolves.toEqual(
        userFixture
      );
    });

    it("insertUsers allows multiple insertions", async () => {
      const users: UserInput[] = [
        {
          id: Date.now().toString() + "-test-1",
          createdAt: new Date("2021-01-02"),
          updatedAt: new Date("2021-01-03"),
        },
        {
          id: Date.now().toString() + "-test-2",
          createdAt: new Date("2021-04-02"),
          updatedAt: new Date("2021-05-03"),
        },
      ];
      await expect(insertUsers(users, connection)).resolves.toEqual(users);
    });

    it("findUsers returns users", async () => {
      await expect(
        findUsers((q) => q.where("id", "=", userFixture.id), connection)
      ).resolves.toEqual([userFixture]);
    });

    it("findUserOrFail returns a user", async () => {
      await expect(
        findUserOrFail((q) => q.where("id", "=", userFixture.id), connection)
      ).resolves.toEqual(userFixture);
    });

    it("findUserOrFail throws if it can't find a user", async () => {
      await expect(
        findUserOrFail(
          (q) => q.where("id", "=", userFixture.id + "doesn't-exist"),
          connection
        )
      ).rejects.toMatchInlineSnapshot(
        `[Error: Error! Unable to find User in findUserOrFail call]`
      );
    });
  });
});
