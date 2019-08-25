import firstObjectByProp from "./firstObjectByProp";

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
