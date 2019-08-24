import deleteFromMemory from "./delete";

it("returns a function", () => {
  expect(deleteFromMemory({})).toBeInstanceOf(Function);
});

it("deletes properly", () => {
  const memoryMap = {
    a: {
      data: {
        id: "a"
      }
    }
  };
  // @ts-ignore
  const deleteFn = deleteFromMemory(memoryMap);
  deleteFn(
    // @ts-ignore
    {
      data: {
        id: "a"
      }
    }
  );
  expect(memoryMap).toEqual({});
});
