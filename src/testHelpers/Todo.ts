import { db } from "./db";
import { createModel } from "model";
import { connect } from "persist/connect";
import { createBridgeTable } from "persist/createBridgeTable";

const persist = connect(db);

let testTableDelta = 0;

export async function createUsersAndTodos() {
  testTableDelta = testTableDelta + 1;

  const userTable = `user_with_todos_${testTableDelta}`;
  const userTablePlural = `${userTable}s`;

  await persist.schema.createTable(userTablePlural, table => {
    table
      .bigInteger("id")
      .unsigned()
      .primary()
      .unique()
      .index();
    table.text("name");
  });

  const todoGroupTable = `todo_group_${testTableDelta}`;
  const todoGroupTablePlural = `${todoGroupTable}s`;

  await persist.schema.createTable(todoGroupTablePlural, table => {
    table
      .bigInteger("id")
      .unsigned()
      .primary()
      .unique()
      .index();
    table.text("name");
  });

  const todoTable = `todo_${testTableDelta}`;
  const todoTablePlural = `${todoTable}s`;

  await persist.schema.createTable(todoTablePlural, table => {
    table
      .bigInteger("id")
      .unsigned()
      .primary()
      .unique()
      .index();
    table.text("todo");
  });

  const settingsTable = `settings_${testTableDelta}`;
  const settingsTablePlural = `${settingsTable}s`;

  await persist.schema.createTable(settingsTablePlural, table => {
    table
      .bigInteger("id")
      .unsigned()
      .primary()
      .unique()
      .index();
    table.text("bio");
  });

  const Settings = createModel<{ id: string; bio: string }>({
    name: settingsTable,
    persistWith: persist
  });

  const Todo = createModel<{ id: string; todo: string }>({
    name: todoTable,
    persistWith: persist
  });

  const TodoGroup = createModel<{ id: string; name: string }>({
    name: todoGroupTable,
    persistWith: persist,
    has: [[Todo]]
  });

  const User = createModel<{
    id: string;
    name: string;
    todos: { todo: string }[];
  }>({
    name: userTable,
    persistWith: persist,
    has: [Settings, [Todo], [TodoGroup]]
  });

  const [
    todoBridgeTableName,
    todoLeftColumn,
    todoRightColumn
  ] = await createBridgeTable(User, Todo);

  const [
    todoGroupTodoBridgeTableName,
    todoGroupTodoLeftColumn,
    todoGroupTodoRightColumn
  ] = await createBridgeTable(TodoGroup, Todo);

  const [
    userTodoGroupBridgeTableName,
    userTodoGroupLeftColumn,
    userTodoGroupRightColumn
  ] = await createBridgeTable(User, TodoGroup);

  const [
    userSettingsBridgeTableName,
    userSettingsLeftColumn,
    userSettingsRightColumn
  ] = await createBridgeTable(User, Settings);

  return {
    User,
    Settings,
    userSettings: {
      bridgeTableName: userSettingsBridgeTableName,
      userColumn: userSettingsLeftColumn,
      settingsColumn: userSettingsRightColumn
    },
    Todo,
    userTodos: {
      bridgeTableName: todoBridgeTableName,
      userColumn: todoLeftColumn,
      todoColumn: todoRightColumn
    },
    userTodoGroups: {
      bridgeTableName: userTodoGroupBridgeTableName,
      userColumn: userTodoGroupLeftColumn,
      todoGroupColumn: userTodoGroupRightColumn
    },
    TodoGroup,
    todoGroupTodos: {
      bridgeTableName: todoGroupTodoBridgeTableName,
      todoGroupColumn: todoGroupTodoLeftColumn,
      todoColumn: todoGroupTodoRightColumn
    }
  };
}
