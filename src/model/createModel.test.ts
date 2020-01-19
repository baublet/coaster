import { many, createModel } from "./createModel";

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

it("allows you to fully reset the data", () => {
  const userModel = createModel({
    name: "User"
  });
  const user = userModel({ id: "user-1" });
  expect(user.id).toBe("user-1");
  user.$setData({
    id: "user-2"
  });
  expect(user.id).toBe("user-2");
});

it("allows you to set has relationships", () => {
  const todoModel = createModel({
    name: "todo"
  });
  const userModel = createModel({
    name: "User",
    has: [many(todoModel)]
  });
  const testModel = createModel({
    name: "test",
    has: [todoModel]
  });
  const user = userModel({ id: "user-1" });
  expect(user.todos.length).toBe(0);

  const todo = todoModel({ task: "Test" });
  expect(user.todos.push(todo));
  expect(user.todos[0].task).toBe("Test");

  const test = testModel({ funk: true });
  test.$setRelationship("todo", todo);
  expect(test.todo.task).toBe("Test");

  const test2 = testModel({ funk: false });
  test2.todo = todoModel({
    task: "Test"
  });
  expect(test2.todo.task).toBe("Test");
});

it("filters out deleted models when accessing a relationship", async () => {
  const todoModel = createModel({
    name: "todo"
  });
  const userModel = createModel({
    name: "User",
    has: [many(todoModel)]
  });
  const user = userModel({ id: "test" });
  user.todos = [
    todoModel({ task: "Test task" }),
    todoModel({ task: "Test task 2" })
  ];

  await expect(user.todos[1].delete()).rejects.toBeTruthy();

  expect(user.todos.length).toBe(1);
  expect(user.todos[0].task).toBe("Test task");
});
