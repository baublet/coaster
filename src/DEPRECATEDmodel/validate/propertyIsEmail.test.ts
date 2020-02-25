import propertyIsEmail from "./propertyIsEmail";

it("returns a function", () => {
  expect(propertyIsEmail("email")).toBeInstanceOf(Function);
});

it("fails on invalid email", () => {
  const validate = propertyIsEmail("email");
  expect(validate({ email: "not an email" })).toBe(
    "email must be an email address"
  );
});

it("succeeds on an email", () => {
  const validate = propertyIsEmail("email");
  expect(validate({ email: "test@bark.com" })).toBe(true);
});

it("allows a custom error", () => {
  const validate = propertyIsEmail("email", "custom");
  expect(validate({ email: "none" })).toBe("custom");
});

it("allows a custom validator", () => {
  const validator = jest.fn();
  validator.mockReturnValue("true");
  const validate = propertyIsEmail("email", "custom", validator);
  expect(validate({ email: "none" })).toBe(true);
  expect(validator).toHaveBeenCalled();
});
