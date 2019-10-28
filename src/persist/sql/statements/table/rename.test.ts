import renameTable from "./rename";

it("renames properly", () => {
  expect(renameTable("test", "test-2")).toBe(
    "ALTER TABLE test RENAME TO test-2"
  );
});
