import { createUsersAndTodos } from "testHelpers/Todo";

async function setup() {
  const {
    User,
    Todo,
    TodoGroup,
    userTodoGroups: { bridgeTableName, todoGroupColumn, userColumn },
    todoGroupTodos: { bridgeTableName: groupTodoBridgeTableName, todoColumn }
  } = await createUsersAndTodos();

  const user = await User.create({ name: "Maggie" });
  const todoGroup = await TodoGroup.create({ name: "Groceries" });
  const groupedTodos = await Promise.all([
    Todo.create({ todo: "Milk" }),
    Todo.create({ todo: "Vegetables" }),
    Todo.create({ todo: "Coffee" })
  ]);

  // Add the user<->todoGroup relationship to the DB
  await User.$options.persist.with(bridgeTableName).insert({
    [userColumn]: user.id,
    [todoGroupColumn]: todoGroup.id
  });

  // Add the todo<->todoGroup relationships to the DB
  await Promise.all(
    groupedTodos.map(groupedTodo =>
      Todo.$options.persist.with(groupTodoBridgeTableName).insert({
        [todoGroupColumn]: todoGroup.id,
        [todoColumn]: groupedTodo.id
      })
    )
  );

  return {
    Todo,
    user,
    todoGroup,
    TodoGroup,
    groupTodoBridgeTableName
  };
}

it("deletes all todos belonging to the group", async () => {
  const { TodoGroup, todoGroup, Todo } = await setup();
  const beforeCount = await Todo.count();
  await TodoGroup.todos.deleteAll(todoGroup);
  const afterCount = await Todo.count();

  expect(beforeCount).toBeGreaterThan(afterCount);
});

it("deletes the entries in the bridge table", async () => {
  const {
    groupTodoBridgeTableName,
    Todo,
    TodoGroup,
    todoGroup
  } = await setup();

  const beforeCount = (
    await Todo.$options.persist.with(groupTodoBridgeTableName).count()
  )[0]["count(*)"];
  await TodoGroup.todos.deleteAll(todoGroup);
  const afterCount = (
    await Todo.$options.persist.with(groupTodoBridgeTableName).count()
  )[0]["count(*)"];

  expect(beforeCount).toBeGreaterThan(afterCount as number);
});
