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
    id: "test",
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

it("allows you to set and access relationships", () => {
  const userModel = createModel({
    name: "User"
  });
  const accountModel = createModel({
    name: "Account"
  });
  const user = userModel({ id: "user-1" });
  const account = accountModel({ id: "account-1" });
  user.$setRelationship("account", account);
  expect(user.account.id).toBe("account-1");
});
