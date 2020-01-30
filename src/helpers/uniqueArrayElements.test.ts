import unique from "./uniqueArrayElements";

it("creates unique array elements", () => {
  expect(unique([1, 1, 3, 2, 5, 2, 1, 34, 1, 2])).toEqual([1, 3, 2, 5, 34]);
});

it("allows custom matchers", () => {
  expect(
    unique(
      [
        {
          id: 3
        },
        {
          id: 3
        }
      ],
      (el1, el2) => el1.id === el2.id
    )
  ).toEqual([{ id: 3 }]);
});
