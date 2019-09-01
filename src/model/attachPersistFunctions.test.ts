import createModel from "./createModel";
import inMemoryPersistence from "persist/memory";
import reloadInvariantViolation from "./error/reloadInvariantViolation";

const memoryMapFn = () => ({
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
});

let memoryMap = memoryMapFn();
let userModel;

beforeEach(() => {
  userModel = createModel({
    name: "user",
    persistWith: inMemoryPersistence(memoryMap)
  });
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

it("deletes a model properly", async () => {
  const user = userModel({
    id: "test-id",
    name: "Test"
  });
  expect(user.name).toBe("Test");
  const deleted = await user.delete();
  expect(deleted).toBeTruthy();
  expect(memoryMap.user["test-id"]).toBe(undefined);
});

it("triggers a reload invariant violation when we try to reload a model we've deleted", async () => {
  const user = userModel({
    id: "test-id",
    name: "Test"
  });
  await user.delete();
  expect(user.reload()).rejects.toBe(
    reloadInvariantViolation("user", "test-id")
  );
});
