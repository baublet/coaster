import removeTable from "./remove";

it("spits out a proper string", () => {
  expect(removeTable("test")).toBe("DROP TABLE test");
});
