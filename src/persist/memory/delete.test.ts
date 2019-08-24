import deleteFromMemory from "./delete";
import createModel from "../../model/createModel";

it("returns a function", async () => {
  expect(deleteFromMemory({})).toBeInstanceOf(Function);
});

it("deletes a model", async () => {
  const memoryMap = {
    // "Collection"
    a: {
      // Model map
      a: {
        data: {
          id: "a"
        }
      }
    }
  };

  // @ts-ignore
  const deleteFn = deleteFromMemory(memoryMap);

  await deleteFn(
    // @ts-ignore
    {
      name: "a",
      data: {
        id: "a"
      }
    }
  );

  expect(memoryMap).toEqual({ a: {} });
});

it("deletes a string", async () => {
  const memoryMap = {
    a: {
      a: {
        data: {
          id: "a"
        }
      }
    }
  };

  // @ts-ignore
  const deleteFn = deleteFromMemory(memoryMap);
  const aModel = createModel({
    name: "a"
  });

  await deleteFn("a", aModel);

  expect(memoryMap).toEqual({ a: {} });
});
