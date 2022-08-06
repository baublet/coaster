import { expect, it } from "@baublet/coaster-unit-test";
import { withWrappedHook } from "./withWrappedHook";

it("is typed correctly", async () => {
  const value1 = "some string";

  const value2: string = await withWrappedHook(undefined, value1);
  expect(value1).toEqual(value2);

  // @ts-expect-error
  const value3: number = value2;
  expect(value2).toEqual(value3);
});

it("is typed correctly using arrays", async () => {
  const value1 = ["a", "b"];

  const [a, b] = await withWrappedHook(undefined, value1);
  expect(value1).toEqual([a, b]);

  // @ts-expect-error
  const value3: number = b;
  expect(b).toEqual(value3);
});

const probablyTrue: boolean = true;
it("invokes the hooks properly", async () => {
  const value1 = (() => {
    if (probablyTrue) {
      return undefined;
    }
    return 123;
  })();

  const value2 = await withWrappedHook(async (arg = 0) => arg + 1, value1);
  expect(value2).toEqual(1);
});
