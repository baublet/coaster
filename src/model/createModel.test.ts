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
  expect(testUser.name).toEqual("Testy McTest");
});

it("allows computed working props", () => {
  interface UserModelTypes {
    firstName: string;
    lastName: string;
  }
  interface UserModelComputedTypes {
    name: string;
  }
  const userModel = createModel<UserModelTypes, UserModelComputedTypes>({
    name: "User",
    computedProps: {
      name: ({ firstName, lastName }) => `${firstName} ${lastName}`
    }
  });
  const testUser = userModel({
    firstName: "Testy",
    lastName: "McTest"
  });
  expect(testUser.name).toBe("Testy McTest");

  testUser.firstName = "Testerson";
  expect(testUser.name).toBe("Testerson McTest");
});
