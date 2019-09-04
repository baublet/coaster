import nameCollision from "./nameCollision";
import generateNames from "helpers/generateNames";

it("returns true if there are no collisions", () => {
  const schema = {
    test: {
      uniqueName: "test1",
      names: generateNames("test")
    },
    test1: {
      uniqueName: "test2",
      names: generateNames("test2")
    }
  };
  // @ts-ignore
  expect(nameCollision(schema)).toBe(true);
});

it("returns error messages if there are collisions", () => {
  const schema = {
    test1: {
      uniqueName: "test1",
      names: generateNames("test1")
    },
    test: {
      uniqueName: "test2",
      names: generateNames("test1")
    },
    id: {
      uniqueName: "id",
      names: generateNames("id")
    }
  };
  // @ts-ignore
  expect(nameCollision(schema))
    .toBe(`One or more properties on your undefined schema are too close and could create irregularities in your data models. Please rename one the following column(s):

- test2, test1, test1, test1s, test1s, test1
  ... has potential collisions with:
  - test1, test1, test1, test1s, test1s, test1`);
});
