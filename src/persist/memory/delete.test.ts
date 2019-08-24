import deleteFromMemory from "./delete";

it("returns a function", async () => {
  expect(deleteFromMemory({})).toBeInstanceOf(Function);
});

it("deletes a model", async () => {
  const memoryMap = {
    a: {
      data: {
        id: "a"
      }
    }
  };

  // @ts-ignore
  const deleteFn = deleteFromMemory(memoryMap);

  await deleteFn(
    // @ts-ignore
    {
      data: {
        id: "a"
      }
    }
  );
  expect(memoryMap).toEqual({});
});

it("deletes a string", async () => {
  const memoryMap = {
    a: {
      data: {
        id: "a"
      }
    }
  };

  // @ts-ignore
  const deleteFn = deleteFromMemory(memoryMap);

  await deleteFn("a");

  expect(memoryMap).toEqual({});
});
