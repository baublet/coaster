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
    groupTodoBridgeTableName,
    groupedTodos
  };
}

it("deletes a todo belonging to the group by id", async () => {
  const { TodoGroup, todoGroup, Todo, groupedTodos } = await setup();
  const beforeCount = await Todo.count();

  await TodoGroup.todos.delete(todoGroup, groupedTodos[0].id);

  const afterCount = await Todo.count();
  expect(beforeCount).toBeGreaterThan(afterCount);
});

it("deletes a todo belonging to the group by multiple ids", async () => {
  const { TodoGroup, todoGroup, Todo, groupedTodos } = await setup();
  const beforeCount = await Todo.count();

  const ids = [groupedTodos[0].id, groupedTodos[1].id];
  await TodoGroup.todos.delete(todoGroup, ids);

  const afterCount = await Todo.count();
  expect(beforeCount - afterCount).toBe(2);
});

it("deletes a todo belonging to the group by multiple ids", async () => {
  const { TodoGroup, todoGroup, Todo, groupedTodos } = await setup();
  const beforeCount = await Todo.count();

  const ids = [groupedTodos[0].id, groupedTodos[1].id];
  await TodoGroup.todos.delete(todoGroup, ids);

  const afterCount = await Todo.count();
  expect(beforeCount - afterCount).toBe(2);
});

it("returns the number of models deleted", async () => {
  const { TodoGroup, todoGroup, groupedTodos } = await setup();

  const ids = [groupedTodos[0].id, "999999"];
  const deleted = await TodoGroup.todos.delete(todoGroup, ids);

  expect(deleted).toBe(1);
});
