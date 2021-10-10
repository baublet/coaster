import { getExpectedTestValueForColumn } from "./getExpectedTestValueForColumn";

it.each`
  type         | expected
  ${"Date"}    | ${"expect.any(Date)"}
  ${"boolean"} | ${"expect.any(Boolean)"}
  ${"number"}  | ${"expect.any(Number)"}
  ${"string"}  | ${"expect.any(String)"}
  ${"enum"}    | ${"expect.any(String)"}
  ${"other"}   | ${"expect.anything()"}
`("$type => $expected", ({ type, expected }) => {
  expect(
    getExpectedTestValueForColumn({
      type,
      ...({} as any),
    })
  ).toEqual(expected);
});
