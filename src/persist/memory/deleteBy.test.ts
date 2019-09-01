import deleteByFactory from "./deleteBy";
import createModel from "../../model/createModel";

const userModel = createModel({
  name: "user"
});

const memoryMap = {
  user: {
    "test-id": {
      id: "test-id",
      name: "Test"
    },
    "test-id2": {
      id: "test-id2",
      name: "Test 2"
    },
    "test-id3": {
      id: "test-id3",
      name: "Test 3"
    }
  }
};

const deleteBy = deleteByFactory(memoryMap);

it("deletes by id", async () => {
  await deleteBy({
    $model: userModel,
    id: "test-id3"
  });
  expect(memoryMap.user["test-id3"]).toBe(undefined);
});
