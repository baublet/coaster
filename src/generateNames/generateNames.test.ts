import { generateNames } from "./generateNames";

it("generates names", () => {
  expect(generateNames("test")).toMatchInlineSnapshot(`
    Object {
      "pluralCamel": "tests",
      "pluralPascal": "Tests",
      "raw": "test",
      "rawCamel": "test",
      "rawPascal": "Test",
      "singularCamel": "test",
      "singularPascal": "Test",
    }
  `);
});

it("generates names robustly; with a blank string", () => {
  expect(generateNames("")).toMatchInlineSnapshot(`
    Object {
      "pluralCamel": "",
      "pluralPascal": "",
      "raw": "",
      "rawCamel": "",
      "rawPascal": "",
      "singularCamel": "",
      "singularPascal": "",
    }
  `);
});
