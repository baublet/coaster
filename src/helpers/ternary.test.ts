import { ternary } from "./ternary";

it("returns the truthy", () => {
  expect(ternary(1, 2, 3)).toEqual(2);
});

it("returns the falsy", () => {
  expect(ternary(0, 1, 2)).toEqual(2);
});
