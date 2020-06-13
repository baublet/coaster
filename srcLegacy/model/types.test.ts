import { isModel } from "./types";

it("returns true if it's a model", () => {
  expect(
    isModel({
      $factory: true
    })
  ).toBe(true);
});
