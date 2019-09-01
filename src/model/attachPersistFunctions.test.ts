import createModel from "./createModel";
import inMemoryPersistence from "persist/memory";

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

const userModel = createModel({
  name: "user",
  persistWith: inMemoryPersistence(memoryMap)
});

it("reloads a model properly", async () => {
  const user = userModel({
    id: "test-id",
    name: "Test"
  });
  expect(user.name).toBe("Test");
  user.name = "Test 2";
  expect(user.name).toBe("Test 2");
  await user.reload();
  expect(user.name).toBe("Test");
});
