import User from "./user";
import Todo from "./todo";

it("doesn't error if we have a name", () => {
  const user = User({ name: "Chrissy" });
  expect(user.valid).toBeTruthy();
  expect(user.errors.length).toBe(0);
});

it("allows fluent accessing of todos", () => {
  const user = User({ name: "Jaime" });
  expect(user.todos).toBeInstanceOf(Array);
  expect(user.todos.length).toBe(0);

  user.todos.push(
    Todo({
      todo: "Do the dishes"
    })
  );
  expect(user.todos.length).toBe(1);
  expect(user.todos[0].todo).toBe("Do the dishes");
});

it("allows fluent accessing of todos with pre-initialized data", () => {
  const user = User({
    name: "Jaime",
    todos: [
      {
        todo: "Do the dishes"
      },
      Todo({ todo: "Clean the shower" })
    ]
  });

  expect(user.todos).toBeInstanceOf(Array);
  expect(user.todos.length).toBe(2);
  expect(user.todos[0].todo).toBe("Do the dishes");
  expect(user.todos[1].todo).toBe("Clean the shower");
});

it("can persist a user", async () => {
  // const user = User({
  //   name: "Jaime"
  // });
});
