// import { createUsersAndTodos } from "testHelpers/Todo";
// import { loadRelationships } from "./loadRelationships";
// import { setPriority } from "os";

// describe("hasMany", () => {
//   it("returns an empty array when there aren't relations to load", async () => {
//     const { User, Todo } = await createUsersAndTodos();

//     const user = await User.create({ name: "Maggie" });

//     await loadRelationships([user]);
//     expect(user[Todo.names.pluralSafe]).toEqual([]);
//   });

//   it("returns models when they're present", async () => {
//     const {
//       User,
//       Todo,
//       userTodos: { bridgeTableName, todoColumn, userColumn }
//     } = await createUsersAndTodos();

//     const user = await User.create({ name: "Maggie" });
//     const todo = await Todo.create({ todo: "Slap the bass" });

//     await User.persistWith(bridgeTableName).insert({
//       [userColumn]: user.id,
//       [todoColumn]: todo.id
//     });

//     await loadRelationships([user]);
//     expect(user[Todo.names.pluralSafe][0].toJson()).toEqual(todo.toJson());
//   });
// });

// describe("hasOne", () => {
//   it("returns null if no connected model found", async () => {
//     const { User, Settings } = await createUsersAndTodos();

//     const user = await User.create({ name: "Maggie" });

//     expect(user[Settings.names.safe]).toBe(null);
//   });

//   it("returns the model when it's present", async () => {
//     const {
//       User,
//       Settings,
//       userSettings: { bridgeTableName, userColumn, settingsColumn }
//     } = await createUsersAndTodos();

//     const user = await User.create({ name: "Maggie" });
//     const settings = await Settings.create({
//       bio: "Born a pauper, died a queen."
//     });

//     await User.persistWith(bridgeTableName).insert({
//       [userColumn]: user.id,
//       [settingsColumn]: settings.id
//     });

//     await loadRelationships([user]);
//     expect(user[Settings.names.safe].toJson()).toEqual(settings.toJson());
//   });
// });

// describe("depth", () => {
//   async function setup() {
//     const {
//       Delivery,
//       Pizza,
//       User,
//       Todo,
//       TodoGroup,
//       userTodoGroups: { bridgeTableName, todoGroupColumn, userColumn },
//       todoGroupTodos: { bridgeTableName: groupTodoBridgeTableName, todoColumn }
//     } = await createUsersAndTodos();

//     const user = await User.create({ name: "Maggie" });
//     const todoGroup = await TodoGroup.create({ name: "Groceries" });
//     const groupedTodos = await Promise.all([
//       Todo.create({ todo: "Milk" }),
//       Todo.create({ todo: "Vegetables" }),
//       Todo.create({ todo: "Coffee" })
//     ]);

//     // Add the user<->todoGroup relationship to the DB
//     await User.persistWith(bridgeTableName).insert({
//       [userColumn]: user.id,
//       [todoGroupColumn]: todoGroup.id
//     });

//     // Add the todo<->todoGroup relationships to the DB
//     await Promise.all(
//       groupedTodos.map(groupedTodo =>
//         Todo.persistWith(groupTodoBridgeTableName).insert({
//           [todoGroupColumn]: todoGroup.id,
//           [todoColumn]: groupedTodo.id
//         })
//       )
//     );

//     // Add a pizza and a delivery to a user
//     const pizza = await Pizza.create({
//       type: "Veggie"
//     });
//     const delivery = Delivery.create({
//       user_id: user.id,
//       pizza_id: pizza.id
//     });

//     return {
//       delivery,
//       Delivery,
//       pizza,
//       Pizza,
//       user,
//       Todo,
//       User,
//       TodoGroup,
//       groupedTodos
//     };
//   }

//   it("loads nested models of depth n", async () => {
//     const { user, Todo, groupedTodos, TodoGroup } = await setup();
//     await loadRelationships([user], undefined, 1);

//     expect(
//       user[TodoGroup.names.pluralSafe][0][Todo.names.pluralSafe].map(todo =>
//         todo.toJson()
//       )
//     ).toEqual(groupedTodos.map(todo => todo.toJson()));
//   });

//   it("properly prevents requerying within the context of a single loadRelationships call", async () => {
//     const { user, User } = await setup();
//     const singlePopulatedData = await loadRelationships([user], undefined, 1);
//     const duplicatedUser1 = User(user.toJson());
//     const duplicatedUser2 = User(user.toJson());
//     const doublePopulatedData = await loadRelationships(
//       [duplicatedUser1, duplicatedUser2],
//       undefined,
//       1
//     );

//     expect(singlePopulatedData).toEqual(doublePopulatedData);
//   });

//   it.only("loads hasMany through relationships", async () => {
//     const { user, Pizza } = await setup();

//     await loadRelationships([user], undefined, 1);

//     expect(user[Pizza.names.pluralSafe]).toEqual(1);
//   });
// });
