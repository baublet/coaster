import { createContext } from "./createContext";

const singletonFn = jest.fn();
const factoryResult = { factory: "result" };
const longPromiseCall = jest.fn();

const testContext = createContext({
  requestContext: { context: 1 },
  nodes: {
    singletonFn: {
      type: "singleton",
      value: singletonFn,
    },
    factoryFn: {
      type: "factory",
      factory: () => factoryResult,
    },
    longPromise: {
      type: "factory",
      factory: (req) =>
        new Promise<typeof req>((resolve) => {
          longPromiseCall();
          setTimeout(() => resolve(req), 10);
        }),
    },
  },
});

it("returns the singleton", () => {
  expect(testContext.singletonFn).toEqual(singletonFn);
});

it("returns the basic factory", () => {
  expect(testContext.factoryFn).toEqual(factoryResult);
});

it("calls the long promise thing only once", async () => {
  const results = await Promise.all([
    testContext.longPromise,
    testContext.longPromise,
    testContext.longPromise,
  ]);

  expect(longPromiseCall).toHaveBeenCalledTimes(1);
  expect(results).toEqual([{ context: 1 }, { context: 1 }, { context: 1 }]);
});
