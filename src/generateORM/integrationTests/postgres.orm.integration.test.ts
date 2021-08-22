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
  updateUser,
  updateUserWhere,
  deleteUser,
  deleteUserWhere,
  isUserLike,
  assertIsUserLike,
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
    describe("Typed CRUD", () => {
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

      it("updateUser updates a user", async () => {
        await expect(
          updateUser(
            { id: userFixture.id, updatedAt: new Date("2021-02-01") },
            connection
          )
        ).resolves.toBe(undefined);
        await expect(
          findUserOrFail((q) => q.where("id", "=", userFixture.id), connection)
        ).resolves.toEqual({
          ...userFixture,
          updatedAt: new Date("2021-02-01"),
        });
      });

      it("updateUserWhere updates a user", async () => {
        await expect(
          updateUserWhere(
            { updatedAt: new Date("2021-05-01") },
            (q) => q.where("id", "=", userFixture.id),
            connection
          )
        ).resolves.toBe(undefined);
        await expect(
          findUserOrFail((q) => q.where("id", "=", userFixture.id), connection)
        ).resolves.toEqual({
          ...userFixture,
          updatedAt: new Date("2021-05-01"),
        });
      });

      it("deleteUser deletes a user", async () => {
        const userId = Date.now().toString() + "-test-delete-user";
        await insertUser({ id: userId }, connection);

        const userEntity = await findUserOrFail(
          (q) => q.where("id", "=", userId),
          connection
        );

        await deleteUser(userEntity, connection);
        await expect(
          findUserOrFail((q) => q.where("id", "=", userId), connection)
        ).rejects.toMatchInlineSnapshot(
          `[Error: Error! Unable to find User in findUserOrFail call]`
        );
      });

      it("deleteUserWhere deletes a user", async () => {
        const userId = Date.now().toString() + "-test-deleteWhere-user";
        await insertUser(
          { id: userId, createdAt: new Date("1999-01-01") },
          connection
        );

        await deleteUserWhere(
          (q) => q.where("created_at", "=", new Date("1999-01-01")),
          connection
        );
        await expect(
          findUserOrFail((q) => q.where("id", "=", userId), connection)
        ).rejects.toMatchInlineSnapshot(
          `[Error: Error! Unable to find User in findUserOrFail call]`
        );
      });
    });
  });

  describe("Transformers and type guards", () => {
    it("isUserLike returns true if the entity is like a user, false otherwise", () => {
      expect(
        isUserLike({ id: "id", createdAt: new Date(), updatedAt: new Date() })
      ).toBe(true);

      expect(isUserLike({ id: "id", createdAt: new Date() })).toBe(false);
      expect(isUserLike(false)).toBe(false);
    });

    it("throws if the entity isn't user like", () => {
      expect(() => assertIsUserLike(1)).toThrowErrorMatchingInlineSnapshot(
        `"Invariance violation! Expected subject to be a User, but it was instead: 1"`
      );
      expect(() => assertIsUserLike({ id: "id" })).toThrow();
      expect(() =>
        assertIsUserLike({
          id: "id",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).not.toThrow();
    });
  });
});
