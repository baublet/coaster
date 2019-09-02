import dataIsMatch from "./dataIsMatch";
import { PersistMatcherType } from "..";

const data: Record<string, any> = {
  name: "T-Shirt Eddie",
  size: 5
};

it("matches model property EQUAL", () => {
  expect(
    dataIsMatch(data, {
      property: "name",
      type: PersistMatcherType.EQUAL,
      value: data.name
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "name",
      type: PersistMatcherType.EQUAL,
      value: "Teddie Hamburger"
    })
  ).toBeFalsy();
});

it("matches model property NOT_EQUAL", () => {
  expect(
    dataIsMatch(data, {
      property: "name",
      type: PersistMatcherType.NOT_EQUAL,
      value: "Teddy Hamburger"
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "name",
      type: PersistMatcherType.NOT_EQUAL,
      value: data.name
    })
  ).toBeFalsy();
});

it("matches model property GREATER_THAN", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.GREATER_THAN,
      value: 3
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.GREATER_THAN,
      value: 6
    })
  ).toBeFalsy();
});

it("matches model property LESS_THAN", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.LESS_THAN,
      value: 6
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.LESS_THAN,
      value: 3
    })
  ).toBeFalsy();
});

it("matches model property ONE_OF", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.ONE_OF,
      value: [3, 4, 5]
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.ONE_OF,
      value: [3, 4, 6]
    })
  ).toBeFalsy();
});

it("matches model property NOT_ONE_OF", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.NOT_ONE_OF,
      value: [3, 4]
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.NOT_ONE_OF,
      value: [3, 4, 5]
    })
  ).toBeFalsy();
});

it("matches model property BETWEEN", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.BETWEEN,
      value: [3, 6]
    })
  ).toBeTruthy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.BETWEEN,
      value: [3, 5]
    })
  ).toBeFalsy();
});

it("matches model property NOT_BETWEEN", () => {
  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.NOT_BETWEEN,
      value: [3, 6]
    })
  ).toBeFalsy();

  expect(
    dataIsMatch(data, {
      property: "size",
      type: PersistMatcherType.NOT_BETWEEN,
      value: [1, 4]
    })
  ).toBeTruthy();
});
