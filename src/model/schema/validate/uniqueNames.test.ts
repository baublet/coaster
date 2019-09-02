import unique from "./uniqueNames";
import log from "helpers/log";

it("returns true if there are no collisions", () => {
  const schema = {
    test: {
      uniqueName: "test1"
    },
    test1: {
      uniqueName: "test2"
    }
  };
  // @ts-ignore
  expect(unique(schema)).toBe(true);
});

it("returns error messages if there are collisions", () => {
  const schema = {
    test: {
      uniqueName: "test1"
    },
    test1: {
      uniqueName: "test1"
    }
  };
  // @ts-ignore
  const errors = unique(schema);
  log(errors);
  expect(typeof errors).toBe("string");
});
