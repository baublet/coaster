import findFromMemory from "./find";
import createModel from "../../model/createModel";

const testModel = createModel({
  name: "test"
});

const memoryMap = {
  test: {
    "test-1": {
      id: "test-1"
    },
    "test-2": {
      id: "test-2"
    },
    "test-3": {
      id: "test-3"
    }
  }
};
// @ts-ignore
const find = findFromMemory(memoryMap);

it("finds by id", async () => {
  const [model] = await find(testModel, "test-1");
  // @ts-ignore
  expect(model.data).toEqual(memoryMap.test["test-1"]);
});

it("finds many by id", async () => {
  const [model1, model2] = await find(testModel, ["test-1", "test-2"]);
  expect(model1.data).toEqual(memoryMap.test["test-1"]);
  expect(model2.data).toEqual(memoryMap.test["test-2"]);
});

it("finds many by id and nulls one not found", async () => {
  const [model1, model2] = await find(testModel, ["test-1", "test-5"]);
  expect(model1.data).toEqual(memoryMap.test["test-1"]);
  expect(model2.data).toEqual(null);
});
