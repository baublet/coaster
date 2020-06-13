import generateNames from "./generateNames";

const generated = generateNames("TypesPer Second");

it("generates a canonical name", () => {
  expect(generated.canonical).toBe("TypesPer Second");
});

it("generates a safe name for databases", () => {
  expect(generated.safe).toBe("types_per_second");
});
