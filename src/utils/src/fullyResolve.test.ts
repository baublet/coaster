import { expect, it } from "@baublet/coaster-unit-test";

import { fullyResolve } from "./fullyResolve";

it.each([
  [`() => 123`, () => 123],
  [`123,`, 123],
  [`Promise.resolve(123),`, Promise.resolve(123)],
  [`Promise.resolve(() => 123),`, Promise.resolve(() => 123)],
  [`() => Promise.resolve(123),`, () => Promise.resolve(123)],
])("returns 123 from subject for %s", async (name, subject) => {
  await expect(fullyResolve(subject)).resolves.toEqual(123);
});
