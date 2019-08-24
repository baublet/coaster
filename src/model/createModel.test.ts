import createModel from "./createModel";

it("passes the smoke test", () => {
  const userModel = createModel({
    name: "User"
  });
  expect(userModel).toBeInstanceOf(Function);
});

it("allows the instantiation of a model", () => {
  const userModel = createModel({
    name: "User"
  });
  const testUser = userModel({
    name: "Testy McTest"
  });
  expect(testUser.data).toEqual({
    name: "Testy McTest"
  });
});

it("allows computed working props", () => {
  const userModel = createModel({
    name: "User",
    computedProps: {
      name: ({ firstName, lastName }) => `${firstName} ${lastName}`
    }
  });
  const testUser = userModel({
    firstName: "Testy",
    lastName: "McTest"
  });
  expect(testUser.computed.name()).toBe("Testy McTest");

  testUser.data.firstName = "Testerson";
  expect(testUser.computed.name()).toBe("Testerson McTest")
});
