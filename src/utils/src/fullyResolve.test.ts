import { expect, it } from "@baublet/coaster-unit-test";

import { fullyResolve } from "./fullyResolve";

it.each([
  [
    () => 123,
    123,
    Promise.resolve(123),
    Promise.resolve(() => 123),
    Promise.resolve(() => () => Promise.resolve(123)),
    () => Promise.resolve(123),
    () => () => Promise.resolve(123),
    () => () => 123,
  ],
])("returns 123 from subject", async (subject) => {
  await expect(fullyResolve(subject)).resolves.toEqual(123);
});
