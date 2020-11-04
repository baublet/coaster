import { generateNames } from "../../helpers";
import { createModel, prop, nullable } from "./createModel";

describe("validators", () => {
  const Todo = createModel({
    name: generateNames("todo"),
    properties: {
      id: prop("string"),
      text: prop("string"),
      complete: nullable("boolean"),
    },
  })
    .withValidator((m) => {
      if (m.complete === false) {
        return "Complete is either null or true";
      }
      return true;
    })
    .withValidators([
      () => true,
      (m) => (m.text.length > 140 ? Promise.resolve("text too long") : true),
    ])
    .withValidator(async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2);
      });
    });

  it("has the right number of validators", () => {
    expect(Todo.$validators.length).toEqual(4);
  });

  it("fails if the next is too long", async () => {
    const todo = await Todo.create({
      id: "test",
      text:
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    await expect(Todo.validate(todo)).resolves.toEqual([
      false,
      ["text too long"],
    ]);
  });

  it("validates if the checks pass", async () => {
    const todo = await Todo.create({
      id: "test",
      text: "clean the damned litter boxes",
    });
    await expect(Todo.validate(todo)).resolves.toEqual([true, []]);
  });
});
