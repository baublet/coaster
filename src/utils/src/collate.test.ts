import { it, expect } from "@baublet/coaster-unit-test";

import { collate } from "./collate";

it("collates results properly", () => {
  const orUndefined: number | undefined = 1;
  const collated = collate(orUndefined, 2, 3, [4, 5], 3, 2, [orUndefined]);
  expect(collated).toEqual([1, 2, 3, 4, 5, 3, 2, 1]);
});
