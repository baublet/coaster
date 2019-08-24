import modelIsMatch from "./modelIsMatch";
import { PersistMatcherType } from "../..";
import { Model } from "../../../model/createModel";

// @ts-ignore
const model: Model = {
  data: {
    name: "T-Shirt Eddie",
    size: 5
  }
};

it("matches model property equality", () => {
  expect(modelIsMatch(model, {
    property: "name",
    type: PersistMatcherType.EQUAL,
    value: model.data.name
  })).toBeTruthy();

  expect(modelIsMatch(model, {
    property: "name",
    type: PersistMatcherType.EQUAL,
    value: "Teddie Hamburger"
  })).toBeFalsy();
})

it("matches model property non-equality", () => {
  expect(modelIsMatch(model, {
    property: "name",
    type: PersistMatcherType.NOT_EQUAL,
    value: "Teddy Hamburger"
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "name",
    type: PersistMatcherType.NOT_EQUAL,
    value: model.data.name
  })).toBeFalsy();
})

it("matches model property greater than", () => {
  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.GREATER_THAN,
    value: 3
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.GREATER_THAN,
    value: 6
  })).toBeFalsy()
})

it("matches model property less than", () => {
  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.LESS_THAN,
    value: 6
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.LESS_THAN,
    value: 3
  })).toBeFalsy()
})

it("matches model property less than", () => {
  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.ONE_OF,
    value: [3, 4, 5]
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.ONE_OF,
    value: [3, 4, 6]
  })).toBeFalsy()
})

it("matches model property between", () => {
  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.BETWEEN,
    value: [3, 6]
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.BETWEEN,
    value: [3, 5]
  })).toBeFalsy()
})

it("matches model property between (greedy)", () => {
  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.BETWEEN_GREEDY,
    value: [3, 5]
  })).toBeTruthy()

  expect(modelIsMatch(model, {
    property: "size",
    type: PersistMatcherType.BETWEEN_GREEDY,
    value: [1,4]
  })).toBeFalsy()
})