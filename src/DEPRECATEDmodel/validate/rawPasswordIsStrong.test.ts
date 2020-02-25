import rawPasswordIsStrong from "./rawPasswordIsStrong";

it("returns a function", () => {
  expect(rawPasswordIsStrong()).toBeInstanceOf(Function);
  expect(rawPasswordIsStrong("test")).toBeInstanceOf(Function);
});

it("returns true if the prop is strong", () => {
  const validate = rawPasswordIsStrong();
  expect(
    validate({
      password: "1200gj G !@#"
    })
  ).toBe(true);
});

it("returns true if custom prop is strong", () => {
  const validate = rawPasswordIsStrong("custom");
  expect(
    validate({
      custom: "1200gj G !@#"
    })
  ).toBe(true);
});

it("uses a custom validator", () => {
  const customValidator = jest.fn();
  customValidator.mockReturnValue(true);
  const validate = rawPasswordIsStrong("custom", customValidator);
  expect(
    validate({
      custom: "1200gj G !@#"
    })
  ).toBe(true);
  expect(customValidator).toHaveBeenCalled();
});
