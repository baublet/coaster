import firstObjectByProp from "./firstObjectByProp";

it("returns no object if it's not there", () => {
  const objects = [
    {
      a: 1
    },
    {
      a: 2
    },
    {
      a: 1
    }
  ];

  expect(firstObjectByProp(objects, "a", 3)).toBe(false);
});

it("returns the first object by prop", () => {
  const objects = [
    {
      a: 1
    },
    {
      a: 2
    },
    {
      a: 1
    }
  ];

  expect(firstObjectByProp(objects, "a", 1)).toBe(objects[0]);
});
