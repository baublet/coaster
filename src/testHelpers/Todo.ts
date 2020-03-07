import { db, getTestTableDelta } from "./db";
import { createPersistedModel } from "persist/createPersistedModel";
import { connect } from "persist/connect";
import { createBridgeTable } from "persist/createBridgeTable";
import { ModelArgsPropertyType } from "model/types";

const persist = connect(db);

export async function createUsersAndTodos() {
  const testTableDelta = getTestTableDelta();

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

  const Settings = createPersistedModel({
    name: settingsTable,
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      },
      bio: {
        type: ModelArgsPropertyType.STRING
      }
    },
    persist: {
      with: persist
    }
  });

  const Todo = createPersistedModel({
    name: todoTable,
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      },
      todo: {
        type: ModelArgsPropertyType.STRING,
        validate: [
          (value: string) => {
            if (value.trim().length > 0) return false;
            return ["Todos must have a length of more than 1"];
          }
        ]
      }
    },
    persist: {
      with: persist
    }
  });

  const TodoGroup = createPersistedModel({
    name: todoGroupTable,
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      },
      name: {
        type: ModelArgsPropertyType.STRING
      },
      todos: {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: Todo,
        many: true
      }
    },
    persist: {
      with: persist
    }
  });

  const User = createPersistedModel({
    name: userTable,
    properties: {
      id: {
        type: ModelArgsPropertyType.STRING
      },
      name: {
        type: ModelArgsPropertyType.STRING
      },
      settings: {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: Settings
      },
      todos: {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: Todo,
        many: true
      },
      todoGroups: {
        type: ModelArgsPropertyType.RELATIONSHIP,
        modelFactory: TodoGroup,
        many: true
      }
    },
    persist: {
      with: persist
    }
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
