import { it, expect } from "@baublet/coaster-unit-test";
import { asyncMap } from "./asyncMap";

it("should map async", async () => {
  const results = await asyncMap([1, 2, 3], async (n) => n * 2);
  expect(results).toEqual([2, 4, 6]);

  // Type test

  // @ts-expect-error
  const strings: string[] = results; // results is number[]!
  expect(strings).toEqual([2, 4, 6]);
});
