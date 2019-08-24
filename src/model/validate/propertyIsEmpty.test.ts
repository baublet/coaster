import propertyIsEmpty from "./propertyIsEmpty";

it("returns a function", () => {
  expect(propertyIsEmpty("test")).toBeInstanceOf(Function);
});

it("returns a function that returns true if the prop is not empty", () => {
  const isPropEmpty = propertyIsEmpty("test");
  expect(isPropEmpty({ test: 123 })).toBeTruthy();
});

it("returns a function that returns a message if the prop is empty", () => {
  const isPropEmpty = propertyIsEmpty("test");
  const message = "test must be a truthy value";
  expect(isPropEmpty({ test: false })).toBe(message);
  expect(isPropEmpty({ test: undefined })).toBe(message);
  expect(isPropEmpty({ test: 0 })).toBe(message);
  expect(isPropEmpty({ test: [] })).toBe(message);
  expect(isPropEmpty({ test: {} })).toBe(message);
});

it("can use a custom message", () => {
  const isPropEmpty = propertyIsEmpty("test", "%prop funk");
  expect(isPropEmpty({ test: false })).toBe("test funk");
});

it("can use a custom emptiness evaluator", () => {
  const mockFn = jest.fn();
  const isPropEmpty = propertyIsEmpty("test", "%prop funk", mockFn);
  isPropEmpty({ test: "false" });
  expect(mockFn).toHaveBeenCalled();
});
