import passwordIsStrong from "./passwordIsStrong";

it("returns true if a password is strong", () => {
  expect(passwordIsStrong("31!@@##F!2f word")).toBe(true);
});

it("returns a string error if it is not strong", () => {
  expect(typeof passwordIsStrong("1")).toBe("string");
});
