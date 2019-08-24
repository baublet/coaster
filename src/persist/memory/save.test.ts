import save from "./save";

it("returns a function", () => {
  expect(save({})).toBeInstanceOf(Function);
});

it("save function saves models properly", () => {
  const map = {};
  const saveFn = save(map);
  saveFn(
    // @ts-ignore
    {
      data: {
        id: "Test 123",
        name: "Testy McTesterson"
      }
    }
  );
  expect(map).toEqual({
    "Test 123": {
      data: {
        id: "Test 123",
        name: "Testy McTesterson"
      }
    }
  });
});
