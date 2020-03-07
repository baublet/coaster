import { createUsersAndTodos } from "testHelpers/Todo";
import { loadRelationships } from "./loadRelationships";

describe("hasMany", () => {
  it("returns an empty array when there aren't relations to load", async () => {
    const { User } = await createUsersAndTodos();

    const user = await User.create({ name: "Maggie" });

    await loadRelationships([user]);
    expect(user.todos).toEqual([]);
  });

  it("returns models when they're present", async () => {
    const {
      User,
      Todo,
      userTodos: { bridgeTableName, todoColumn, userColumn }
    } = await createUsersAndTodos();

    const user = await User.create({ name: "Maggie" });
    const todo = await Todo.create({ todo: "Slap the bass" });

    await User.$options.persist.with(bridgeTableName).insert({
      [userColumn]: user.id,
      [todoColumn]: todo.id
    });

    await loadRelationships([user]);
    expect(Todo.toJson(user.todos[0])).toEqual(Todo.toJson(todo));
  });
});

describe("hasOne", () => {
  it("returns null if no connected model found", async () => {
    const { User } = await createUsersAndTodos();

    const user = await User.create({ name: "Maggie" });

    await loadRelationships([user]);
    expect(user.settings).toBe(null);
  });

  it("returns the model when it's present", async () => {
    const {
      User,
      Settings,
      userSettings: { bridgeTableName, userColumn, settingsColumn }
    } = await createUsersAndTodos();

    const user = await User.create({ name: "Maggie" });
    const settings = await Settings.create({
      bio: "Born a pauper, died a queen."
    });

    await User.$options.persist.with(bridgeTableName).insert({
      [userColumn]: user.id,
      [settingsColumn]: settings.id
    });

    await loadRelationships([user]);
    expect(Settings.toJson(user.settings)).toEqual(Settings.toJson(settings));
  });
});

describe("specific fields", () => {
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
      user,
      Todo,
      User,
      TodoGroup,
      groupedTodos
    };
  }

  it("loads specific models when asked", async () => {
    const { user, Todo, groupedTodos } = await setup();
    await loadRelationships([user], ["todos"]);

    expect(user.todos).toEqual([]);
    expect(user.todoGroups).toEqual(undefined);

    await loadRelationships([user], ["todoGroups"]);

    expect(user.todoGroups[0].todos.map(todo => Todo.toJson(todo))).toEqual(
      groupedTodos.map(todo => Todo.toJson(todo))
    );
  });

  it("properly prevents requerying within the context of a single loadRelationships call", async () => {
    const { user, User } = await setup();
    const singlePopulatedData = await loadRelationships([user], ["todos"]);
    const duplicatedUser1 = User(User.$data(user));
    const duplicatedUser2 = User(User.$data(user));
    const doublePopulatedData = await loadRelationships(
      [duplicatedUser1, duplicatedUser2],
      ["todos"]
    );

    expect(singlePopulatedData).toEqual(doublePopulatedData);
  });
});
