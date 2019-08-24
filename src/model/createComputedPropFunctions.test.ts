import createComputedPropFunctions from "./createComputedPropFunctions";
import { stringLiteral } from "@babel/types";
import { Model } from "./createModel";

it("properly encapsulates the computers with our model data", () => {
  const model: any = {
    name: "Test",
    data: {
      a: 1,
      b: 2
    }
  };

  const computedProps = {
    testComputed: (data: any) => data.a + data.b
  };

  const computedClosures = createComputedPropFunctions<Record<string, any>>(
    model,
    computedProps
  );

  expect(computedClosures.testComputed()).toBe(3);
});
