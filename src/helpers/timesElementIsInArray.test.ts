import times from "./timesElementIsInArray";

it("returns 0 if an item is not in an array", () => {
  expect(times(1, [2, 3, 4])).toBe(0);
});

it("returns 1 if an item is in an array once", () => {
  expect(times(2, [2, 3, 4])).toBe(1);
});

it("returns 2 if an item is in an array twice", () => {
  expect(times(2, [2, 2, 4])).toBe(2);
});

it("accepts a custom comparator", () => {
  const mock = jest.fn();
  times(1, [], mock);
  expect(mock).toHaveBeenCalled();
});
