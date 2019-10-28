import createTableString from "./create";

it("works for a table name", () => {
  expect(createTableString("test")).toBe("CREATE TABLE IF NOT EXISTS test");
});

it("works for a table name", () => {
  expect(createTableString("test", false)).toBe("CREATE TABLE test");
});
