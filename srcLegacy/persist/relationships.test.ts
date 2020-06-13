import { createUsersAndTodos } from "testHelpers/Todo";

it("creates the relationships array properly", async () => {
  const { User, Todo, TodoGroup, Settings } = await createUsersAndTodos();

  expect(User.$relationships).toEqual([
    expect.objectContaining({
      accessor: "settings",
      bridgeTableName: "settings_0_user_with_todos_0_relationships",
      foreignKey: "settings_0_id",
      localKey: "user_with_todos_0_id",
      modelFactory: Settings
    }),
    expect.objectContaining({
      accessor: "todos",
      bridgeTableName: "todo_0_user_with_todos_0_relationships",
      foreignKey: "todo_0_id",
      localKey: "user_with_todos_0_id",
      many: true,
      modelFactory: Todo
    }),
    expect.objectContaining({
      accessor: "todoGroups",
      bridgeTableName: "todo_group_0_user_with_todos_0_relationships",
      foreignKey: "todo_group_0_id",
      localKey: "user_with_todos_0_id",
      many: true,
      modelFactory: TodoGroup
    })
  ]);
});
