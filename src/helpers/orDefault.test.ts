import { orDefault } from "./orDefault";

it("returns the right stuff", () => {
  expect(orDefault([undefined, null, "test"], "default")).toEqual("test");

  expect(orDefault([undefined, "test", "test 2"], "default")).toEqual("test");

  expect(orDefault([undefined], "default")).toEqual("default");
});
