import createModel from "./createModel";

it("runs a function before create", () => {
  const hook = jest.fn();
  const userModel = createModel({
    name: "User",
    hooks: {
      beforeCreate: hook
    }
  });
  userModel({
    name: "Burt"
  });
  expect(hook).toHaveBeenCalledWith({
    initialData: {
      name: "Burt"
    }
  });
});

it("runs a function before create that modifies the data", () => {
  const hook = ({ initialData }) => {
    initialData.name = initialData.name + " Test";
  };
  const userModel = createModel({
    name: "User",
    hooks: {
      beforeCreate: hook
    }
  });
  const user = userModel({
    name: "Burt"
  });
  expect(user.name).toBe("Burt Test");
});

it("runs a function after create", () => {
  const hook = jest.fn();
  const userModel = createModel({
    name: "User",
    hooks: {
      afterCreate: hook
    }
  });
  const user = userModel({
    name: "Burt"
  });
  expect(hook).toHaveBeenCalledWith({
    model: user
  });
});
