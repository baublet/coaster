import { shouldExclude } from "./shouldExclude";

it("returns false if there are no needles", () => {
  expect(shouldExclude([], "test")).toEqual(false);
});

it("returns true if the subject should be excluded", () => {
  expect(shouldExclude(["test", "123"], "test")).toEqual(true);
});

it("returns false if the subject should _not_ be excluded", () => {
  expect(shouldExclude(["test", "123"], "it works!")).toEqual(false);
});
