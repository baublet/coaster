import { createUsersAndTodos } from "testHelpers/Todo";
import * as cae from "persist/connectionsAreEqual";

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
    Todo.create({ todo: "groceries - Milk" }),
    Todo.create({ todo: "groceries - Vegetables" }),
    Todo.create({ todo: "groceries - Coffee" }),
    Todo.create({ todo: "Laundry" }),
    Todo.create({ todo: "Dentist" })
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

function connectionsAreEqual(equal: boolean) {
  jest.spyOn(cae, "connectionsAreEqual").mockImplementation(() => equal);
}

afterEach(jest.restoreAllMocks);

["multiple", "single"].forEach(strat => {
  it(`finds a todo belonging to the group matching "groceries": ${strat}`, async () => {
    connectionsAreEqual(strat === "single");
    const { TodoGroup, Todo, todoGroup } = await setup();

    const todos = await TodoGroup.todos.findWhere(
      todoGroup,
      q => q.where("todo", "like", "groceries%"),
      { limit: 1 }
    );

    expect(todos[0].$factory).toEqual(Todo);
  });

  it(`finds a todo belonging to the group matching "groceries", ordering by todo: ${strat}`, async () => {
    connectionsAreEqual(strat === "single");
    const { TodoGroup, todoGroup } = await setup();

    const todos = await TodoGroup.todos.findWhere(
      todoGroup,
      q => q.where("todo", "like", "groceries%"),
      {
        order: [{ by: "todo" }]
      }
    );

    expect(todos).toEqual([
      expect.objectContaining({
        todo: "groceries - Coffee"
      }),
      expect.objectContaining({
        todo: "groceries - Milk"
      }),
      expect.objectContaining({
        todo: "groceries - Vegetables"
      })
    ]);
  });
});
