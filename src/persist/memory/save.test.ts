import save from "./save";

it("returns a function", () => {
  expect(save({})).toBeInstanceOf(Function);
});

it("save function saves models properly", async () => {
  const map = {};
  const saveFn = save(map);
  await saveFn(
    // @ts-ignore
    {
      name: "user",
      data: {
        id: "Test 123",
        name: "Testy McTesterson"
      }
    }
  );
  expect(map).toEqual({
    user: {
      "Test 123": {
        id: "Test 123",
        name: "Testy McTesterson"
      }
    }
  });
});
