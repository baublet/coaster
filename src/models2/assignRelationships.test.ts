import { assignRelationships } from "./assignRelationships";
import { ModelArgsPropertyType, ModelFactory } from "./types";

it("returns undefined if we don't pass anything in", () => {
  expect(
    assignRelationships(
      {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: {} as ModelFactory
      },
      undefined
    )
  ).toBe(undefined);
});

it("returns a model if the initial data is a model", () => {
  const model = {
    $factory: (jest.fn() as any) as ModelFactory
  };
  expect(
    assignRelationships(
      {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: {} as ModelFactory
      },
      model
    )
  ).toBe(model);
});

it("returns a model array if the initial data is a model array", () => {
  const models = [
    {
      $factory: (jest.fn() as any) as ModelFactory
    }
  ];
  expect(
    assignRelationships(
      {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: ({} as any) as ModelFactory
      },
      models
    )
  ).toEqual(models);
});

it("returns a model array if the initial data is just data", () => {
  const factory = (jest.fn().mockImplementation(d => d) as any) as ModelFactory;
  const modelData = {
    test: "data"
  };
  expect(
    assignRelationships(
      {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: factory
      },
      modelData
    )
  ).toEqual(factory(modelData));
  expect(factory).toHaveBeenCalledWith({ test: "data" });
});

it("returns a model array if the initial data is an aray of data", () => {
  const factory = (jest.fn().mockImplementation(d => d) as any) as ModelFactory;
  const modelData = [
    {
      test: "data"
    },
    {
      test: "more-data"
    }
  ];
  expect(
    assignRelationships(
      {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: factory
      },
      modelData
    )
  ).toEqual([factory(modelData[0]), factory(modelData[1])]);
  expect(factory).toHaveBeenCalledWith({ test: "data" });
  expect(factory).toHaveBeenCalledWith({ test: "more-data" });
});
