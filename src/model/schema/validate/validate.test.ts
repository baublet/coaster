import validate from "./validate";

it("runs through our schema validators", () => {
  const mockFn1 = jest.fn();
  const mockFn2 = jest.fn();
  validate({ $tableName: "test" }, [mockFn1, mockFn2]);
  expect(mockFn1).toHaveBeenCalled();
  expect(mockFn2).toHaveBeenCalled();
});
