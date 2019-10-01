import findBy from "./findBy";

it("returns a proper statement", () => {
  const statement = findBy({ test: 2 });
  expect(statement).toEqual({
    query: "test = ?",
    values: [2]
  });
});

it("returns a proper $and statement", () => {
  const statement = findBy({ $and: true, test: 2, taco: "tuesday" });
  expect(statement).toEqual({
    query: "test = ? AND taco = ?",
    values: [2, "tuesday"]
  });
});

it("returns a proper $or statement", () => {
  const statement = findBy({ $or: true, test: 2, taco: "tuesday" });
  expect(statement).toEqual({
    query: "test = ? OR taco = ?",
    values: [2, "tuesday"]
  });
});

it("returns a proper $and statement", () => {
  const statement = findBy({ $or: true, test: 2, taco: "tuesday" });
  expect(statement).toEqual({
    query: "test = ? OR taco = ?",
    values: [2, "tuesday"]
  });
});

it("returns a proper $with statement", () => {
  const statement = findBy({
    test: 2,
    $with: [
      {
        taco: "tuesday"
      }
    ]
  });
  expect(statement).toEqual({
    query: "test = ? AND ((taco = ?))",
    values: [2, "tuesday"]
  });
});

it("returns a proper $without statement", () => {
  const statement = findBy({
    test: 2,
    $without: [
      {
        taco: "tuesday"
      }
    ]
  });
  expect(statement).toEqual({
    query: "test = ? AND NOT ((taco = ?))",
    values: [2, "tuesday"]
  });
});

it("returns a proper $without statement", () => {
  const statement = findBy({
    test: 2,
    $without: [
      {
        taco: "tuesday",
        feet: "itch"
      },
      {
        $or: true,
        pizza: true,
        frenchFries: true
      }
    ]
  });
  expect(statement).toEqual({
    query:
      "test = ? AND NOT ((taco = ? AND feet = ?) OR (pizza = ? OR frenchFries = ?))",
    values: [2, "tuesday", "itch", true, true]
  });
});
