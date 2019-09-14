import compose, { maximumComposers } from "./compose";
import tooManyComposersError from "model/error/tooManyComposers";

it("doesn't error when no composers are passed in", () => {
  expect(() =>
    compose(
      "Test",
      [],
      {},
      [],
      []
    )
  ).not.toThrow();
});

it("properly mutates has, validators, and computed props, and runs additional composers added at compile-time", () => {
  const computed: any = {};
  const has: any[] = [];
  const validators: any[] = [];
  const mockComposer = jest.fn();
  expect(() =>
    compose(
      "Test",
      [
        ({ composers, computedProps, has, validators }: any) => {
          computedProps.test = 123;
          has.push("test");
          validators.push("test 2");
          composers.push(mockComposer);
        }
      ],
      computed,
      has,
      validators
    )
  ).not.toThrow();
  expect(computed.test).toBe(123);
  expect(has[0]).toBe("test");
  expect(validators[0]).toBe("test 2");
  expect(mockComposer).toHaveBeenCalled();
});

it("prevents infinite composer errors", () => {
  const composer = ({ composers }: any) => {
    composers.push(composer);
  };
  expect(() =>
    compose(
      "Test",
      [composer],
      {},
      [],
      []
    )
  ).toThrow(tooManyComposersError("Test", maximumComposers));
});
