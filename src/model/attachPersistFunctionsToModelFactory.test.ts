import createModel from "./createModel";
import inMemoryPersistence from "persist/memory";

const memoryMapFn = () => ({
  default: {
    users: {
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

it.only("finds a model properly", async () => {
  expect(userModel.find).toBeInstanceOf(Function);
  const user = await userModel.find("test-id");
  expect(user).toBeTruthy();
  expect(user.id).toBe("test-id");
});
