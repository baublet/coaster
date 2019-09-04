import multiplePrimaryKeys from "./multiplePrimaryKeys";
import multiplePrimaryKeysError from "../error/multiplePrimaryKeys";

const schema = {
  $tableName: "test",
  id: {
    persistOptions: {
      primaryKey: true
    }
  },
  _id: {
    persistOptions: {
      primaryKey: true
    }
  }
};

it("fails with multiple primary keys", () => {
  // @ts-ignore
  expect(multiplePrimaryKeys(schema)).toBe(
    multiplePrimaryKeysError("test", "id, _id")
  );
});

it("doesn't fail with a single primary key", () => {
  // @ts-ignore
  expect(
    multiplePrimaryKeys({
      // @ts-ignore
      id: {
        persistOptions: {
          primaryKey: true
        }
      }
    })
  ).toBe(true);
});
