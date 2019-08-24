import findFromMemory from "./find";

const memoryMap = {
  "test-1": {
    data: {
      id: "test-1"
    }
  },
  "test-2": {
    data: {
      id: "test-2"
    }
  },
  "test-3": {
    data: {
      id: "test-3"
    }
  }
};
// @ts-ignore
const find = findFromMemory(memoryMap);

it("finds by id", async () => {
  expect(await find("test-1")).toBe(memoryMap["test-1"]);
});

it("finds many by id", async () => {
  expect(await find(["test-1", "test-2"])).toEqual([
    memoryMap["test-1"],
    memoryMap["test-2"]
  ]);
});

it("finds many by id and nulls one not found", async () => {
  expect(await find(["test-1", "test-5"])).toEqual([memoryMap["test-1"], null]);
});
