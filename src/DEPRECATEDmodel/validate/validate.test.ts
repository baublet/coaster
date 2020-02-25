import validate, { Validator } from "./validate";

it("returns true if all the validators are true", () => {
  const validators: Validator<Record<string, string>>[] = [
    () => true,
    () => true
  ];
  expect(validate({}, {}, validators)).toBe(true);
});

it("returns false if one or more of the validators return strings", () => {
  const validators: Validator<Record<string, string>>[] = [
    () => true,
    () => "test 1",
    () => "test 2"
  ];
  expect(validate({}, {}, validators)).toEqual(["test 1", "test 2"]);
});
