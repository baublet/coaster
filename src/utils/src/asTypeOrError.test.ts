import { expect, it } from "@baublet/coaster-unit-test";

import { isCoasterError } from "./isCoasterError";

import { asTypeOrError } from "./asTypeOrError";

it.each([
  ["string", "hello world"],
  ["number", 123],
  ["boolean", true],
  ["undefined", undefined],
  ["null", null],
  ["object", {}],
  ["function", () => 2],
])("does nothing if it's a %s", (type, subject) => {
  expect(asTypeOrError(type as any, subject)).toEqual(subject);
});

it.each([
  ["function", "hello world"],
  ["string", 123],
  ["number", true],
  ["boolean", undefined],
  ["null", undefined],
  ["null", {}],
  ["object", () => 2],
])("throws if it's NOT a %s", (type, subject) => {
  const value = asTypeOrError(type as any, subject);
  expect(isCoasterError(value)).toEqual(true);
});
